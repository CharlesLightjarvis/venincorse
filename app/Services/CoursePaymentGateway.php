<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\CoursePaymentPlan;
use App\Models\CourseEnrollment;
use App\Models\CourseInstallment;
use Stripe\Checkout\Session;
use Stripe\Exception\CardException;
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

    /**
     * The enrollment's payment page. With the instalment plan it charges the first instalment and saves the card
     * for the next ones (Stripe "setup_future_usage: off_session"); the student is told so on the page and in the terms.
     */
    public function create(CourseEnrollment $enrollment): Session
    {
        $metadata = ['course_enrollment_id' => $enrollment->id];
        $isInstallments = $enrollment->payment_plan === CoursePaymentPlan::Installments;
        $count = count($enrollment->payment_plan->amountsCents($enrollment->amount_cents));

        return $this->client()->checkout->sessions->create([
            'mode' => 'payment',
            'client_reference_id' => $enrollment->id,
            'customer_email' => $enrollment->user->email,
            ...($isInstallments ? ['customer_creation' => 'always'] : []),
            'success_url' => $this->returnUrl(),
            'cancel_url' => $this->returnUrl(),
            'expires_at' => $enrollment->expires_at->timestamp,
            'metadata' => $metadata,
            'payment_intent_data' => [
                'metadata' => $metadata,
                ...($isInstallments ? ['setup_future_usage' => 'off_session'] : []),
            ],
            'line_items' => [[
                'price_data' => [
                    'currency' => strtolower($enrollment->currency),
                    'unit_amount' => $enrollment->checkoutAmountCents(),
                    'product_data' => ['name' => $this->productName($enrollment).($isInstallments ? ' — échéance 1/'.$count : '')],
                ],
                'quantity' => 1,
            ]],
        ], ['idempotency_key' => 'course-checkout-'.$enrollment->id]);
    }

    /** A payment page for an instalment the automatic charge could not take; the card used is saved for the next ones. */
    public function createInstallmentCheckout(CourseInstallment $installment): Session
    {
        $enrollment = $installment->enrollment;
        $metadata = ['course_installment_id' => (string) $installment->id];
        $count = count($enrollment->payment_plan->amountsCents($enrollment->amount_cents));

        return $this->client()->checkout->sessions->create([
            'mode' => 'payment',
            'client_reference_id' => 'installment-'.$installment->id,
            ...($enrollment->stripe_customer_id
                ? ['customer' => $enrollment->stripe_customer_id]
                : ['customer_email' => $enrollment->user->email, 'customer_creation' => 'always']),
            'success_url' => $this->returnUrl(),
            'cancel_url' => $this->returnUrl(),
            'metadata' => $metadata,
            'payment_intent_data' => ['metadata' => $metadata, 'setup_future_usage' => 'off_session'],
            'line_items' => [[
                'price_data' => [
                    'currency' => strtolower($enrollment->currency),
                    'unit_amount' => $installment->amount_cents,
                    'product_data' => ['name' => $this->productName($enrollment).' — échéance '.$installment->position.'/'.$count],
                ],
                'quantity' => 1,
            ]],
        ], ['idempotency_key' => 'course-installment-checkout-'.$installment->id.'-'.$installment->attempts.'-'.now()->format('YmdH')]);
    }

    /**
     * Charges a due instalment on the card saved at enrollment, without the student being present.
     *
     * @return array<string, mixed>
     *
     * @throws CardException When the bank declines or asks the student to authenticate.
     */
    public function chargeInstallment(CourseInstallment $installment, string $customerId, string $paymentMethodId): array
    {
        return $this->client()->paymentIntents->create([
            'amount' => $installment->amount_cents,
            'currency' => strtolower($installment->enrollment->currency),
            'customer' => $customerId,
            'payment_method' => $paymentMethodId,
            'off_session' => true,
            'confirm' => true,
            'description' => $this->productName($installment->enrollment).' — échéance '.$installment->position,
            'metadata' => ['course_installment_id' => (string) $installment->id],
        ], ['idempotency_key' => 'course-installment-'.$installment->id.'-'.$installment->attempts])->toArray();
    }

    /** @return array<string, mixed> */
    public function paymentIntent(string $paymentIntentId): array
    {
        return $this->client()->paymentIntents->retrieve($paymentIntentId)->toArray();
    }

    private function productName(CourseEnrollment $enrollment): string
    {
        return __('courses.product_name', [
            'level' => strtoupper($enrollment->cohort->level->value),
            'format' => $enrollment->cohort->format->label(),
        ], 'fr');
    }

    private function returnUrl(): string
    {
        return rtrim(config('trials.public_url') ?: config('app.url'), '/')
            .route('course-enrollments.index', ['refresh' => 1], false);
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
