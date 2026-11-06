<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\TrialReservationStatus;
use App\Exceptions\TrialRefundFailed;
use App\Models\TrialReservation;
use App\Models\TrialSlotHold;
use App\Notifications\TrialRefunded;
use App\Services\TrialPaymentGateway;
use App\Services\TrialReservationLock;
use Illuminate\Support\Facades\DB;

final readonly class ApplyTrialPayment
{
    public function __construct(
        private CreateTrialSlotHold $createSlotHold,
        private CreateTrialRefund $createRefund,
        private CreateTrialBookedNotifications $notifyBooked,
        private CreateTrialPaymentAlert $alert,
        private TrialReservationLock $lock,
    ) {}

    /** @param array<string, mixed> $session */
    public function handle(array $session, string $eventType): void
    {
        $reference = data_get($session, 'metadata.reservation_id');
        if (! is_string($reference) || ($session['livemode'] ?? null) !== TrialPaymentGateway::liveMode()) {
            return;
        }

        $this->lock->run($reference, function () use ($session, $reference, $eventType): void {
            /** @var array{refundable: ?TrialReservation, confirmed: ?TrialReservation, alert: ?string} $outcome */
            $outcome = DB::transaction(fn (): array => $this->apply($session, $reference, $eventType), 5);

            if ($outcome['confirmed']) {
                $this->notifyBooked->handle($outcome['confirmed']);
            }
            if ($outcome['refundable']) {
                $this->refundLatePayment($outcome['refundable'], $session['payment_intent'] ?? null);
            } elseif ($outcome['alert'] !== null) {
                $this->alert->handle(TrialReservation::query()->find($reference), $outcome['alert']);
            }
        });
    }

    public function expireUnstarted(TrialReservation $reservation): void
    {
        DB::transaction(function () use ($reservation): void {
            $updated = TrialReservation::query()->whereKey($reservation->id)
                ->whereNull('checkout_started_at')->where('expires_at', '<', now())
                ->where('status', TrialReservationStatus::Pending)
                ->update(['status' => TrialReservationStatus::Expired]);
            if ($updated > 0) {
                TrialSlotHold::query()->where('trial_reservation_id', $reservation->id)->delete();
            }
        }, 5);
    }

    /**
     * @param  array<string, mixed>  $session
     * @return array{refundable: ?TrialReservation, confirmed: ?TrialReservation, alert: ?string}
     */
    private function apply(array $session, string $reference, string $eventType): array
    {
        $none = ['refundable' => null, 'confirmed' => null, 'alert' => null];
        $reservation = TrialReservation::query()->with('slot')->lockForUpdate()->find($reference);
        if (! $reservation || in_array($reservation->status, TrialReservationStatus::finalCases(), true)) {
            return $none;
        }
        if (($session['client_reference_id'] ?? null) !== $reservation->id
            || ! is_string($session['id'] ?? null)
            || ($reservation->stripe_session_id && $reservation->stripe_session_id !== $session['id'])) {
            return $none;
        }
        $isPaid = ($session['payment_status'] ?? '') === 'paid';
        $reservation->stripe_session_id = $session['id'];

        if (($session['amount_total'] ?? null) !== $reservation->amount_cents
            || strtoupper($session['currency'] ?? '') !== $reservation->currency) {
            $wasUnderReview = $reservation->status === TrialReservationStatus::PaymentReview;
            $reservation->status = TrialReservationStatus::PaymentReview;
            $reservation->save();

            return $wasUnderReview ? $none : [...$none, 'alert' => 'le montant payé ne correspond pas au prix du cours d’essai.'];
        }

        if ($reservation->status === TrialReservationStatus::PaymentReview) {
            if (! $isPaid || $reservation->paid_at !== null) {
                $reservation->save();

                return $none;
            }
            $reservation->paid_at = now();
            $reservation->save();

            return [...$none, 'alert' => 'le paiement est arrivé pour un essai déjà en vérification. Confirme la séance ou rembourse l’élève.'];
        }

        if ($isPaid) {
            $reservation->paid_at ??= now();
            if (! $this->slotStillBookable($reservation)) {
                $reservation->status = TrialReservationStatus::PaymentReview;
                $reservation->save();

                return [...$none, 'refundable' => $reservation];
            }
            if ($this->createSlotHold->handle($reservation)) {
                $reservation->status = TrialReservationStatus::Confirmed;
                $reservation->save();

                return [...$none, 'confirmed' => $reservation];
            }
            $reservation->status = TrialReservationStatus::PaymentReview;
            $reservation->save();

            return [...$none, 'refundable' => $reservation];
        }

        if (($eventType === 'checkout.session.expired' && ($session['status'] ?? '') === 'expired'
            && $reservation->status === TrialReservationStatus::Pending)
            || ($eventType === 'checkout.session.async_payment_failed'
                && in_array($reservation->status, [TrialReservationStatus::Pending, TrialReservationStatus::Processing], true))) {
            $reservation->status = TrialReservationStatus::Expired;
            TrialSlotHold::query()->where('trial_reservation_id', $reservation->id)->delete();
        } elseif (($session['status'] ?? '') === 'complete'
            && $reservation->status === TrialReservationStatus::Pending) {
            $reservation->status = TrialReservationStatus::Processing;
        }
        $reservation->save();

        return $none;
    }

    /**
     * A payment that arrives late (delayed bank payment, or after the attempt expired) only keeps its slot when the
     * session is still comfortably ahead and the slot was not withdrawn from the schedule meanwhile.
     */
    private function slotStillBookable(TrialReservation $reservation): bool
    {
        $slot = $reservation->slot;
        if ($slot->starts_at->lt(now()->addHours((int) config('trials.late_payment_cutoff_hours')))) {
            return false;
        }
        $hasHold = TrialSlotHold::query()->where('trial_reservation_id', $reservation->id)->exists();
        $withinBookingWindow = $slot->starts_at->gte(now()->addHours((int) config('trials.minimum_notice_hours')));

        return $hasHold || $slot->is_published || ! $withinBookingWindow;
    }

    /** A late payment that cannot keep its slot is refunded; a failure stays visible for manual review. */
    private function refundLatePayment(TrialReservation $reservation, mixed $paymentIntent): void
    {
        if (! is_string($paymentIntent)) {
            $this->alert->handle($reservation, 'un paiement est arrivé trop tard pour garder son créneau, et Stripe n’a pas indiqué le paiement à rembourser.');

            return;
        }
        try {
            $this->createRefund->handle($reservation, $paymentIntent);
        } catch (TrialRefundFailed) {
            $this->alert->handle($reservation, 'un paiement est arrivé trop tard pour garder son créneau et son remboursement automatique a échoué. Rembourse l’élève.');

            return;
        }
        $refunded = DB::transaction(function () use ($reservation): int {
            $updated = TrialReservation::query()->whereKey($reservation->id)
                ->where('status', TrialReservationStatus::PaymentReview)
                ->update(['status' => TrialReservationStatus::Refunded]);
            if ($updated > 0) {
                TrialSlotHold::query()->where('trial_reservation_id', $reservation->id)->delete();
            }

            return $updated;
        });
        if ($refunded > 0) {
            $reservation->loadMissing(['slot', 'user'])->user->notify(new TrialRefunded($reservation));
        }
    }
}
