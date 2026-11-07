<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CourseEnrollment;
use Stripe\Checkout\Session;
use Stripe\StripeClient;

/**
 * Stripe Checkout for course enrollments. Readiness, mode and session retrieval are shared with the trial
 * lessons (same Stripe account and webhook); the session expires with the seat hold.
 */
class CoursePaymentGateway
{
    public function __construct(private readonly TrialPaymentGateway $trialGateway) {}

    public function ready(): bool
    {
        return $this->trialGateway->ready();
    }

    public function create(CourseEnrollment $enrollment): Session
    {
        $metadata = ['course_enrollment_id' => $enrollment->id];
        $returnUrl = rtrim(config('trials.public_url') ?: config('app.url'), '/')
            .route('course-enrollments.index', ['refresh' => 1], false);

        return $this->client()->checkout->sessions->create([
            'mode' => 'payment',
            'client_reference_id' => $enrollment->id,
            'customer_email' => $enrollment->user->email,
            'success_url' => $returnUrl,
            'cancel_url' => $returnUrl,
            'expires_at' => $enrollment->expires_at->timestamp,
            'metadata' => $metadata,
            'payment_intent_data' => ['metadata' => $metadata],
            'line_items' => [[
                'price_data' => [
                    'currency' => strtolower($enrollment->currency),
                    'unit_amount' => $enrollment->amount_cents,
                    'product_data' => ['name' => __('courses.product_name', [
                        'level' => strtoupper($enrollment->cohort->level->value),
                        'format' => $enrollment->cohort->format->label(),
                    ], 'fr')],
                ],
                'quantity' => 1,
            ]],
        ], ['idempotency_key' => 'course-checkout-'.$enrollment->id]);
    }

    /** @return array<string, mixed> */
    public function session(string $sessionId): array
    {
        return $this->trialGateway->session($sessionId);
    }

    /** @return array<string, mixed> */
    public function expireSession(string $sessionId): array
    {
        return $this->trialGateway->expireSession($sessionId);
    }

    public function refund(CourseEnrollment $enrollment, string $paymentIntentId, ?int $amountCents = null): void
    {
        $this->client()->refunds->create(
            array_filter([
                'payment_intent' => $paymentIntentId,
                'amount' => $amountCents,
                'metadata' => ['course_enrollment_id' => $enrollment->id],
            ], fn (mixed $value): bool => $value !== null),
            ['idempotency_key' => 'course-refund-'.$enrollment->id.'-'.($amountCents ?? 'full')],
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
