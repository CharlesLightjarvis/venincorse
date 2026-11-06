<?php

declare(strict_types=1);

namespace App\Services;

use KenDeNigerian\PayZephyr\Contracts\DriverInterface;
use KenDeNigerian\PayZephyr\DataObjects\ChargeRequestDTO;
use KenDeNigerian\PayZephyr\DataObjects\ChargeResponseDTO;
use KenDeNigerian\PayZephyr\DataObjects\VerificationResponseDTO;
use KenDeNigerian\PayZephyr\Drivers\StripeDriver;
use Stripe\StripeClient;

/**
 * PayZephyr's bundled driver fixes card-only methods and omits session expiry.
 * Keep its verification support, but use expiring dynamic-method Checkout for slots.
 */
final readonly class TrialStripeDriver implements DriverInterface
{
    private StripeDriver $delegate;

    private StripeClient $stripe;

    /** @param array<string, mixed> $config */
    public function __construct(array $config)
    {
        $this->delegate = new StripeDriver($config);
        $this->stripe = new StripeClient([
            'api_key' => $config['secret_key'],
            'stripe_version' => '2026-10-28.endive',
            'max_network_retries' => 0,
        ]);
    }

    public function charge(ChargeRequestDTO $request): ChargeResponseDTO
    {
        $suffix = substr(strtr(hash('sha256', (string) $request->reference), '0123456789', 'abcdefghij'), 0, 8);
        $session = $this->stripe->checkout->sessions->create([
            'mode' => 'payment',
            'integration_identifier' => 'venincorse-trial-'.$suffix,
            'client_reference_id' => $request->reference,
            'customer_email' => $request->email,
            'success_url' => $request->callbackUrl,
            'cancel_url' => $request->callbackUrl,
            'expires_at' => (int) $request->metadata['expires_at'],
            'metadata' => $request->metadata,
            'payment_intent_data' => ['metadata' => $request->metadata],
            'line_items' => [[
                'price_data' => [
                    'currency' => strtolower($request->currency),
                    'unit_amount' => $request->getAmountInMinorUnits(),
                    'product_data' => ['name' => $request->description],
                ],
                'quantity' => 1,
            ]],
        ], ['idempotency_key' => $request->idempotencyKey]);

        return new ChargeResponseDTO(
            reference: (string) $request->reference, authorizationUrl: $session->url,
            accessCode: $session->id, status: 'pending', provider: 'stripe',
            metadata: ['session_id' => $session->id],
        );
    }

    public function verify(string $reference): VerificationResponseDTO
    {
        return $this->delegate->verify($reference);
    }

    public function validateWebhook(array $headers, string $body): bool
    {
        return $this->delegate->validateWebhook($headers, $body);
    }

    public function healthCheck(): bool
    {
        return $this->delegate->healthCheck();
    }

    public function getName(): string
    {
        return 'stripe';
    }

    public function getSupportedCurrencies(): array
    {
        return ['EUR'];
    }

    public function extractWebhookReference(array $payload): ?string
    {
        return $this->delegate->extractWebhookReference($payload);
    }

    public function extractWebhookStatus(array $payload): string
    {
        return $this->delegate->extractWebhookStatus($payload);
    }

    public function extractWebhookChannel(array $payload): ?string
    {
        return $this->delegate->extractWebhookChannel($payload);
    }

    public function resolveVerificationId(string $reference, string $providerId): string
    {
        return $this->delegate->resolveVerificationId($reference, $providerId);
    }
}
