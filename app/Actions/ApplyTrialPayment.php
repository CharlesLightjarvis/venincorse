<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\TrialReservationStatus;
use App\Models\TrialReservation;
use App\Models\TrialSlotHold;
use App\Services\TrialPaymentGateway;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Throwable;

final readonly class ApplyTrialPayment
{
    public function __construct(private TrialPaymentGateway $gateway) {}

    /** @param array<string, mixed> $session */
    public function handle(array $session, string $eventType): void
    {
        $reference = data_get($session, 'metadata.reservation_id');
        if (! is_string($reference) || ($session['livemode'] ?? true) !== false) {
            return;
        }
        $refundable = DB::transaction(function () use ($session, $reference, $eventType): ?TrialReservation {
            $reservation = TrialReservation::query()->lockForUpdate()->find($reference);
            if (! $reservation || in_array($reservation->status, [TrialReservationStatus::Confirmed, TrialReservationStatus::Refunded], true)) {
                return null;
            }
            if (($session['client_reference_id'] ?? null) !== $reservation->id
                || ! is_string($session['id'] ?? null)
                || ($reservation->stripe_session_id && $reservation->stripe_session_id !== $session['id'])) {
                return null;
            }
            if (($session['amount_total'] ?? null) !== $reservation->amount_cents
                || strtoupper($session['currency'] ?? '') !== $reservation->currency) {
                $reservation->update(['status' => TrialReservationStatus::PaymentReview]);

                return null;
            }
            $reservation->stripe_session_id = $session['id'];
            $refundable = null;
            if (($session['payment_status'] ?? '') === 'paid') {
                $reservation->paid_at ??= now();
                if ($this->secureSlot($reservation)) {
                    $reservation->status = TrialReservationStatus::Confirmed;
                } else {
                    $reservation->status = TrialReservationStatus::PaymentReview;
                    $refundable = $reservation;
                }
            } elseif (($eventType === 'checkout.session.expired' && ($session['status'] ?? '') === 'expired'
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

            return $refundable;
        }, 5);

        if ($refundable) {
            $this->refundLatePayment($refundable, $session['payment_intent'] ?? null);
        }
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
     * Keep the slot for a paid reservation: its own hold, or the slot again if it is still free
     * and the student has no other trial lesson.
     */
    private function secureSlot(TrialReservation $reservation): bool
    {
        $hold = TrialSlotHold::query()->where('trial_reservation_id', $reservation->id)->first();
        if ($hold) {
            return $hold->trial_slot_id === $reservation->trial_slot_id;
        }
        $hasOtherTrial = TrialReservation::query()
            ->where('user_id', $reservation->user_id)
            ->whereKeyNot($reservation->id)
            ->whereIn('status', TrialReservationStatus::bookedCases())
            ->exists();
        if ($hasOtherTrial) {
            return false;
        }
        try {
            DB::transaction(fn () => TrialSlotHold::query()->create([
                'trial_slot_id' => $reservation->trial_slot_id,
                'trial_reservation_id' => $reservation->id,
            ]));
        } catch (UniqueConstraintViolationException) {
            return false;
        }

        return true;
    }

    /** A late payment for a slot given to someone else is refunded; a failure stays visible for manual review. */
    private function refundLatePayment(TrialReservation $reservation, mixed $paymentIntent): void
    {
        if (! is_string($paymentIntent) || ! $this->gateway->ready()) {
            return;
        }
        try {
            $this->gateway->refund($reservation, $paymentIntent);
        } catch (Throwable $exception) {
            report($exception);

            return;
        }
        TrialReservation::query()->whereKey($reservation->id)
            ->where('status', TrialReservationStatus::PaymentReview)
            ->update(['status' => TrialReservationStatus::Refunded]);
    }
}
