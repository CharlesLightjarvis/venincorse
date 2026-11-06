<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\TrialReservation;
use KenDeNigerian\PayZephyr\DataObjects\ChargeRequestDTO;
use KenDeNigerian\PayZephyr\DataObjects\ChargeResponseDTO;
use KenDeNigerian\PayZephyr\PaymentManager;
use Stripe\Exception\InvalidRequestException;
use Stripe\StripeClient;

class TrialPaymentGateway
{
    public function __construct(private readonly PaymentManager $payments) {}

    /** Test keys always work; live keys only once `TRIAL_TEST_MODE_ONLY` is turned off for production. */
    public function ready(): bool
    {
        $key = (string) config('payments.providers.stripe.secret_key');
        $isTestKey = str_starts_with($key, 'sk_test_') || str_starts_with($key, 'rk_test_');
        $isLiveKey = str_starts_with($key, 'sk_live_') || str_starts_with($key, 'rk_live_');

        return ($isTestKey || ($isLiveKey && ! config('trials.test_mode_only')))
            && str_starts_with((string) config('payments.providers.stripe.webhook_secret'), 'whsec_');
    }

    /** Whether Stripe objects are expected in live mode; events from the other mode are ignored. */
    public static function liveMode(): bool
    {
        $key = (string) config('payments.providers.stripe.secret_key');

        return str_starts_with($key, 'sk_live_') || str_starts_with($key, 'rk_live_');
    }

    public function create(TrialReservation $reservation): ChargeResponseDTO
    {
        return $this->payments->driver('stripe')->charge(new ChargeRequestDTO(
            amount: $reservation->amount_cents / 100,
            currency: $reservation->currency,
            email: $reservation->user->email,
            reference: $reservation->id,
            callbackUrl: rtrim(config('trials.public_url') ?: config('app.url'), '/').route('trial-reservations.index', ['refresh' => 1], false),
            metadata: ['reservation_id' => $reservation->id, 'expires_at' => (string) $reservation->expires_at->timestamp],
            description: __('trials.product_name', [], 'fr'),
            idempotencyKey: 'trial-checkout-'.$reservation->id,
        ));
    }

    /** @return array<string, mixed> */
    public function session(string $sessionId): array
    {
        return $this->client()->checkout->sessions->retrieve($sessionId)->toArray();
    }

    /**
     * Close an abandoned Checkout Session so it can no longer be paid, and return its final state.
     * A session that is no longer open (paid meanwhile, or already expired) is returned as it is.
     *
     * @return array<string, mixed>
     */
    public function expireSession(string $sessionId): array
    {
        try {
            return $this->client()->checkout->sessions->expire($sessionId)->toArray();
        } catch (InvalidRequestException) {
            return $this->session($sessionId);
        }
    }

    public function refund(TrialReservation $reservation, string $paymentIntentId): void
    {
        $this->client()->refunds->create(
            ['payment_intent' => $paymentIntentId, 'metadata' => ['reservation_id' => $reservation->id]],
            ['idempotency_key' => 'trial-refund-'.$reservation->id],
        );
    }

    private function client(): StripeClient
    {
        return new StripeClient([
            'api_key' => (string) config('payments.providers.stripe.secret_key'),
            'stripe_version' => '2026-10-28.endive',
        ]);
    }
}
