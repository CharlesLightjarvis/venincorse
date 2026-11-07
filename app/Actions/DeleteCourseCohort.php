<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\CourseEnrollmentStatus;
use App\Models\CourseCohort;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * A group nobody joined can be deleted with its schedule. As soon as a student enrolled (or is paying), the
 * group stays for the record: the teacher closes it to new enrollments instead.
 */
final readonly class DeleteCourseCohort
{
    public function handle(CourseCohort $cohort): void
    {
        DB::transaction(function () use ($cohort): void {
            $cohort = CourseCohort::query()->lockForUpdate()->findOrFail($cohort->id);
            $hasEnrollments = $cohort->enrollments()
                ->where(fn ($query) => $query->where('status', '!=', CourseEnrollmentStatus::Expired)->orWhereNotNull('paid_at'))
                ->exists();
            if ($hasEnrollments) {
                throw ValidationException::withMessages(['cohort' => __('courses.cohort_not_deletable', [], 'fr')]);
            }
            $cohort->enrollments()->delete();
            $cohort->delete();
        });
    }
}
