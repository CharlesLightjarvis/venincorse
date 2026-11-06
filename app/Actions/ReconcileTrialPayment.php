<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\TrialReservationStatus;
use App\Models\TrialReservation;
use App\Services\TrialPaymentGateway;
use Illuminate\Support\Facades\Cache;
use Stripe\Exception\ApiErrorException;

/**
 * Asks Stripe for the real outcome of a reservation's Checkout Session, so a missed or
 * delayed webhook never leaves a paid reservation pending (Stripe recommends fulfilling
 * from both the webhook and the customer's return).
 */
final readonly class ReconcileTrialPayment
{
    public function __construct(
        private TrialPaymentGateway $gateway,
        private ApplyTrialPayment $applyPayment,
    ) {}

    public function handle(TrialReservation $reservation, bool $force = false): TrialReservation
    {
        if (! $reservation->stripe_session_id
            || ! in_array($reservation->status, [TrialReservationStatus::Pending, TrialReservationStatus::Processing], true)
            || ! $this->gateway->ready()) {
            return $reservation;
        }
        // Even a forced check (Stripe return, "Actualiser", scheduler) asks Stripe at most once every 2 seconds.
        if (! Cache::add('trial-reconcile:'.$reservation->id, true, $force ? 2 : 5)) {
            return $reservation;
        }
        try {
            $session = $this->gateway->session($reservation->stripe_session_id);
        } catch (ApiErrorException $exception) {
            report($exception);

            return $reservation;
        }
        if (($session['status'] ?? '') !== 'open') {
            $this->applyPayment->handle($session, ($session['status'] ?? '') === 'expired'
                ? 'checkout.session.expired' : 'checkout.session.completed');
        }

        return $reservation->refresh();
    }
}
