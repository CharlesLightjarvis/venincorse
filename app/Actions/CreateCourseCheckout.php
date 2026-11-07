<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\CourseEnrollmentStatus;
use App\Models\CourseEnrollment;
use App\Services\CoursePaymentGateway;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;
use Throwable;

/**
 * Opens (or reopens) the Stripe payment page of an unpaid enrollment. A page already opened is reused after
 * checking with Stripe that it was not paid meanwhile, so a student never pays twice.
 */
final readonly class CreateCourseCheckout
{
    public function __construct(
        private CoursePaymentGateway $gateway,
        private ReconcileCourseEnrollmentPayment $reconcile,
    ) {}

    public function handle(CourseEnrollment $enrollment): string
    {
        if (! $this->gateway->ready()) {
            throw ValidationException::withMessages(['payment' => __('courses.payment_unavailable', [], 'fr')]);
        }

        return Cache::lock('course-checkout:'.$enrollment->id, 120)->block(5, function () use ($enrollment): string {
            $enrollment->refresh()->load(['cohort', 'user']);
            if ($enrollment->checkout_url) {
                $enrollment = $this->reconcile->handle($enrollment, force: true);
            }
            if ($enrollment->status !== CourseEnrollmentStatus::Pending) {
                throw ValidationException::withMessages(['payment' => match ($enrollment->status) {
                    CourseEnrollmentStatus::Confirmed => __('courses.already_enrolled', [], 'fr'),
                    CourseEnrollmentStatus::Expired => __('courses.payment_expired', [], 'fr'),
                    default => __('courses.payment_processing', [], 'fr'),
                }]);
            }
            if ($enrollment->checkout_url && $enrollment->expires_at->isFuture()) {
                return $enrollment->checkout_url;
            }
            // Stripe requires a payment page to stay open at least 30 minutes.
            if ($enrollment->expires_at->lt(now()->addMinutes(31))) {
                throw ValidationException::withMessages(['payment' => __('courses.payment_expired', [], 'fr')]);
            }
            CourseEnrollment::query()->whereKey($enrollment->id)->update(['checkout_started_at' => now()]);
            try {
                $session = $this->gateway->create($enrollment);
            } catch (Throwable $exception) {
                report($exception);

                throw ValidationException::withMessages(['payment' => __('courses.payment_failed', [], 'fr')]);
            }
            abort_unless(is_string($session->url) && str_starts_with($session->url, 'https://checkout.stripe.com/'), 502);
            CourseEnrollment::query()->whereKey($enrollment->id)
                ->update(['stripe_session_id' => $session->id, 'checkout_url' => $session->url]);

            return $session->url;
        });
    }
}
