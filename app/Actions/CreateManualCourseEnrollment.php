<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\CourseEnrollmentStatus;
use App\Enums\CoursePaymentMethod;
use App\Enums\CoursePaymentPlan;
use App\Models\CourseCohort;
use App\Models\CourseEnrollment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * The team enrolls a student itself: a free seat, a bank transfer or a move from another enrollment.
 * Nothing goes through Stripe, so the payment is recorded as settled and the seat is taken immediately.
 */
final readonly class CreateManualCourseEnrollment
{
    public function handle(
        User $student,
        CourseCohort $cohort,
        CoursePaymentMethod $method,
        ?string $reference,
        string $goal,
    ): CourseEnrollment {
        return DB::transaction(function () use ($student, $cohort, $method, $reference, $goal): CourseEnrollment {
            $cohort = CourseCohort::query()->lockForUpdate()->findOrFail($cohort->id);

            if ($cohort->isCancelled() || $cohort->hasStarted() || $cohort->seatsLeft() < 1) {
                throw ValidationException::withMessages(['cohort_id' => __('courses.manual_enrollment_unavailable', [], 'fr')]);
            }

            $alreadyEnrolled = CourseEnrollment::query()
                ->where('user_id', $student->id)
                ->where('course_cohort_id', $cohort->id)
                ->holdingSeat()
                ->exists();

            if ($alreadyEnrolled) {
                throw ValidationException::withMessages(['email' => __('courses.manual_enrollment_already_enrolled', [], 'fr')]);
            }

            return CourseEnrollment::query()->create([
                'user_id' => $student->id,
                'course_cohort_id' => $cohort->id,
                'status' => CourseEnrollmentStatus::Confirmed,
                'payment_plan' => CoursePaymentPlan::Full,
                'payment_method' => $method,
                'payment_reference' => $method === CoursePaymentMethod::Offer ? null : $reference,
                'goal' => trim($goal) !== '' ? trim($goal) : '—',
                'timezone' => config('trials.timezone'),
                'amount_cents' => $method === CoursePaymentMethod::Offer ? 0 : $cohort->price_cents,
                'currency' => $cohort->currency,
                'expires_at' => now(),
                'paid_at' => now(),
                'terms_accepted_at' => now(),
                'terms_version' => config('trials.terms_version'),
                'early_start_requested_at' => $cohort->starts_at->lt(now()->addDays((int) config('courses.withdrawal_days'))) ? now() : null,
            ]);
        }, 5);
    }
}
