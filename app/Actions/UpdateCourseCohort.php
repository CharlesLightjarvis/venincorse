<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\CourseEnrollmentStatus;
use App\Models\CourseCohort;
use App\Models\User;
use App\Notifications\CourseMeetingLinkShared;
use Illuminate\Support\Facades\Notification;

/**
 * The teacher updates a group's visio link, its number of seats or whether it is open for booking. A new or
 * changed link is emailed to the enrolled students while the group still has sessions to come.
 */
final readonly class UpdateCourseCohort
{
    /** @param array{meeting_url?: ?string, capacity?: int, is_published?: bool} $attributes */
    public function handle(CourseCohort $cohort, array $attributes): CourseCohort
    {
        $cohort->update($attributes);

        if ($cohort->wasChanged('meeting_url') && $cohort->meeting_url && $cohort->ends_at->isFuture() && ! $cohort->isCancelled()) {
            $students = User::query()->whereHas('courseEnrollments', fn ($query) => $query
                ->where('course_cohort_id', $cohort->id)
                ->where('status', CourseEnrollmentStatus::Confirmed))->get();
            Notification::send($students, new CourseMeetingLinkShared($cohort));
        }

        return $cohort;
    }
}
