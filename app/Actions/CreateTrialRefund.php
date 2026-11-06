<?php

declare(strict_types=1);

namespace App\Actions;

use App\Exceptions\TrialRefundFailed;
use App\Models\TrialReservation;
use App\Services\TrialPaymentGateway;
use Throwable;

/**
 * Refunds the full payment of a reservation through Stripe. The refund is idempotent per reservation,
 * so retrying after a failure never refunds twice.
 */
final readonly class CreateTrialRefund
{
    public function __construct(private TrialPaymentGateway $gateway) {}

    /** @throws TrialRefundFailed */
    public function handle(TrialReservation $reservation, ?string $paymentIntent = null): void
    {
        if (! $this->gateway->ready()) {
            throw TrialRefundFailed::because('The payment gateway is not configured.');
        }
        try {
            $paymentIntent ??= $this->paymentIntent($reservation);
            $this->gateway->refund($reservation, $paymentIntent);
        } catch (TrialRefundFailed $exception) {
            throw $exception;
        } catch (Throwable $exception) {
            report($exception);

            throw TrialRefundFailed::because('Stripe refused the refund.', $exception);
        }
    }

    private function paymentIntent(TrialReservation $reservation): string
    {
        if (! $reservation->stripe_session_id) {
            throw TrialRefundFailed::because('The reservation has no Stripe Checkout Session.');
        }
        $paymentIntent = $this->gateway->session($reservation->stripe_session_id)['payment_intent'] ?? null;
        if (! is_string($paymentIntent)) {
            throw TrialRefundFailed::because('The Checkout Session has no payment to refund.');
        }

        return $paymentIntent;
    }
}
