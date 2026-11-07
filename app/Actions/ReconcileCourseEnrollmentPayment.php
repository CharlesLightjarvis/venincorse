<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\CourseEnrollmentStatus;
use App\Models\CourseEnrollment;
use App\Services\CoursePaymentGateway;
use Illuminate\Support\Facades\Cache;
use Throwable;

/**
 * Asks Stripe for the real outcome of an enrollment's payment page, so a missed or delayed webhook never
 * leaves a paid enrollment pending.
 */
final readonly class ReconcileCourseEnrollmentPayment
{
    public function __construct(
        private CoursePaymentGateway $gateway,
        private ApplyCourseEnrollmentPayment $applyPayment,
    ) {}

    public function handle(CourseEnrollment $enrollment, bool $force = false): CourseEnrollment
    {
        if (! $enrollment->stripe_session_id
            || ! in_array($enrollment->status, [CourseEnrollmentStatus::Pending, CourseEnrollmentStatus::Processing], true)
            || ! $this->gateway->ready()) {
            return $enrollment;
        }
        if (! Cache::add('course-reconcile:'.$enrollment->id, true, $force ? 2 : 5)) {
            return $enrollment;
        }
        try {
            $session = $this->gateway->session($enrollment->stripe_session_id);
        } catch (Throwable $exception) {
            report($exception);

            return $enrollment;
        }
        if (($session['status'] ?? '') !== 'open') {
            $this->applyPayment->handle($session, ($session['status'] ?? '') === 'expired'
                ? 'checkout.session.expired' : 'checkout.session.completed');
        }

        return $enrollment->refresh();
    }
}
