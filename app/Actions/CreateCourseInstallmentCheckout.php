<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\CourseInstallment;
use App\Services\CoursePaymentGateway;
use Illuminate\Validation\ValidationException;
use Throwable;

/** Opens a Stripe payment page for a due instalment the student settles themselves. */
final readonly class CreateCourseInstallmentCheckout
{
    public function __construct(private CoursePaymentGateway $gateway) {}

    public function handle(CourseInstallment $installment): string
    {
        $installment->refresh()->load('enrollment.user', 'enrollment.cohort');
        if (! $installment->isPayable() || ! $this->gateway->ready()) {
            throw ValidationException::withMessages(['installment' => __('courses.installment_not_payable', [], 'fr')]);
        }
        try {
            $session = $this->gateway->createInstallmentCheckout($installment);
        } catch (Throwable $exception) {
            report($exception);

            throw ValidationException::withMessages(['installment' => __('courses.payment_failed', [], 'fr')]);
        }
        abort_unless(is_string($session->url) && str_starts_with($session->url, 'https://checkout.stripe.com/'), 502);
        $installment->update(['stripe_session_id' => $session->id, 'checkout_url' => $session->url]);

        return $session->url;
    }
}
