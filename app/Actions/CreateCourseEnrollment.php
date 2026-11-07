<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\CourseEnrollmentStatus;
use App\Enums\CoursePaymentPlan;
use App\Models\CourseCohort;
use App\Models\CourseEnrollment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * A student joins a group: one seat is held for them while they pay. The group row is locked, so two students
 * can never take the last seat at once. Coming back to the same group reuses the unpaid attempt.
 */
final readonly class CreateCourseEnrollment
{
    /** @param array{goal: string, timezone: string, early_start: bool} $data */
    public function handle(User $user, CourseCohort $cohort, array $data): CourseEnrollment
    {
        return DB::transaction(function () use ($user, $cohort, $data): CourseEnrollment {
            $cohort = CourseCohort::query()->lockForUpdate()->findOrFail($cohort->id);
            $existing = CourseEnrollment::query()->lockForUpdate()
                ->where('user_id', $user->id)
                ->where('course_cohort_id', $cohort->id)
                ->holdingSeat()
                ->first();

            if ($existing && $existing->status !== CourseEnrollmentStatus::Pending) {
                throw ValidationException::withMessages(['cohort_id' => __('courses.already_enrolled', [], 'fr')]);
            }
            if (! $existing && ! $cohort->isBookable()) {
                throw ValidationException::withMessages(['cohort_id' => __('courses.cohort_unavailable', [], 'fr')]);
            }
            $attributes = [
                'goal' => trim($data['goal']),
                'timezone' => $data['timezone'],
                'terms_accepted_at' => now(),
                'terms_version' => config('trials.terms_version'),
                'early_start_requested_at' => $data['early_start'] ? now() : null,
            ];
            if ($existing) {
                $existing->update($existing->checkout_started_at === null
                    ? [...$attributes, 'expires_at' => now()->addMinutes((int) config('courses.hold_minutes'))]
                    : $attributes);

                return $existing;
            }

            return CourseEnrollment::query()->create([
                ...$attributes,
                'user_id' => $user->id,
                'course_cohort_id' => $cohort->id,
                'status' => CourseEnrollmentStatus::Pending,
                'payment_plan' => CoursePaymentPlan::Full,
                'amount_cents' => $cohort->price_cents,
                'currency' => $cohort->currency,
                'expires_at' => now()->addMinutes((int) config('courses.hold_minutes')),
            ]);
        }, 5);
    }
}
