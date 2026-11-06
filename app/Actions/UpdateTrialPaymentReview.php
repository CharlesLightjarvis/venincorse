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
use Throwable;

/**
 * Resolves a payment that needed a manual check: the session is confirmed (only if its slot can still be kept
 * for this student), the student is refunded, or, when nothing was charged, the slot is simply released.
 */
final readonly class UpdateTrialPaymentReview
{
    public function __construct(
        private CreateTrialSlotHold $createSlotHold,
        private CreateTrialRefund $createRefund,
        private CreateTrialBookedNotifications $notifyBooked,
        private TrialPaymentGateway $gateway,
        private TrialReservationLock $lock,
    ) {}

    public function confirm(TrialReservation $reservation): bool
    {
        $confirmed = $this->lock->run($reservation->id, function () use ($reservation): bool {
            $reservation->refresh();
            if ($reservation->status !== TrialReservationStatus::PaymentReview
                || $reservation->paid_at === null
                || $reservation->hasStarted()) {
                return false;
            }

            return DB::transaction(fn (): bool => $this->createSlotHold->handle($reservation)
                && TrialReservation::query()->whereKey($reservation->id)
                    ->where('status', TrialReservationStatus::PaymentReview)
                    ->update(['status' => TrialReservationStatus::Confirmed]) > 0);
        });

        if ($confirmed) {
            $this->notifyBooked->handle($reservation->refresh());
        }

        return $confirmed;
    }

    /** @throws TrialRefundFailed */
    public function refund(TrialReservation $reservation): bool
    {
        $refunded = $this->lock->run($reservation->id, function () use ($reservation): bool {
            $reservation->refresh();
            if ($reservation->status !== TrialReservationStatus::PaymentReview) {
                return false;
            }
            $this->createRefund->handle($reservation);

            return $this->closeReview($reservation, TrialReservationStatus::Refunded);
        });

        if ($refunded) {
            $reservation->refresh()->load(['slot', 'user'])->user->notify(new TrialRefunded($reservation));
        }

        return $refunded;
    }

    /**
     * Nothing was charged (the student left Stripe, or the attempt never reached it): the Checkout Session is
     * closed so it can no longer be paid, then the slot is released and the student may book again.
     */
    public function release(TrialReservation $reservation): bool
    {
        return $this->lock->run($reservation->id, function () use ($reservation): bool {
            $reservation->refresh();
            if ($reservation->status !== TrialReservationStatus::PaymentReview || $reservation->paid_at !== null) {
                return false;
            }
            if ($reservation->stripe_session_id) {
                try {
                    $session = $this->gateway->expireSession($reservation->stripe_session_id);
                } catch (Throwable $exception) {
                    report($exception);

                    return false;
                }
                if (($session['payment_status'] ?? '') !== 'unpaid') {
                    return false;
                }
            }

            return $this->closeReview($reservation, TrialReservationStatus::Expired);
        });
    }

    private function closeReview(TrialReservation $reservation, TrialReservationStatus $status): bool
    {
        return DB::transaction(function () use ($reservation, $status): bool {
            $updated = TrialReservation::query()->whereKey($reservation->id)
                ->where('status', TrialReservationStatus::PaymentReview)
                ->update(['status' => $status]);
            if ($updated > 0) {
                TrialSlotHold::query()->where('trial_reservation_id', $reservation->id)->delete();
            }

            return $updated > 0;
        });
    }
}
