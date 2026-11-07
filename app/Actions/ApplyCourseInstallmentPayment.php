<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\CourseInstallment;
use App\Services\CoursePaymentGateway;
use App\Services\TrialPaymentGateway;
use App\Services\TrialReservationLock;
use Throwable;

/**
 * Applies a Stripe outcome to an instalment: the student paid it on its payment page, or Stripe confirmed an
 * automatic charge late. The card used on the page becomes the one charged for the next instalments.
 */
final readonly class ApplyCourseInstallmentPayment
{
    public function __construct(
        private CoursePaymentGateway $gateway,
        private UpdateCourseInstallmentPaid $markPaid,
        private TrialReservationLock $lock,
    ) {}

    /** @param array<string, mixed> $object A Checkout Session or a PaymentIntent. */
    public function handle(array $object): void
    {
        $reference = data_get($object, 'metadata.course_installment_id');
        if (! is_string($reference) || ($object['livemode'] ?? null) !== TrialPaymentGateway::liveMode()) {
            return;
        }
        $installment = CourseInstallment::query()->find((int) $reference);
        $isSession = ($object['object'] ?? null) === 'checkout.session';
        $isPaid = $isSession ? ($object['payment_status'] ?? '') === 'paid' : ($object['status'] ?? '') === 'succeeded';
        $amount = $isSession ? ($object['amount_total'] ?? null) : ($object['amount_received'] ?? null);
        $paymentIntentId = $isSession ? ($object['payment_intent'] ?? null) : ($object['id'] ?? null);
        if (! $installment || ! $isPaid || $amount !== $installment->amount_cents || ! is_string($paymentIntentId)) {
            return;
        }

        $this->lock->run($installment->course_enrollment_id, function () use ($installment, $paymentIntentId, $isSession): void {
            $this->markPaid->handle($installment, $paymentIntentId, $isSession ? $this->paymentMethod($paymentIntentId) : null);
        });
    }

    private function paymentMethod(string $paymentIntentId): ?string
    {
        try {
            $paymentMethod = $this->gateway->paymentIntent($paymentIntentId)['payment_method'] ?? null;
        } catch (Throwable $exception) {
            report($exception);

            return null;
        }

        return is_string($paymentMethod) ? $paymentMethod : null;
    }
}
