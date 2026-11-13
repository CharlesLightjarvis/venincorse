<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\CourseEnrollmentStatus;
use App\Enums\CourseRhythm;
use App\Models\CourseCohort;
use App\Models\User;
use App\Notifications\CourseScheduleChanged;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;

/**
 * The teacher replans the rest of a group: the sessions already started stay as history, the hours still due are
 * laid out again from the chosen date on the new rhythm, and every confirmed student is emailed the new plan.
 */
final readonly class UpdateCourseCohortSchedule
{
    public function __construct(private GenerateCourseSchedule $schedule) {}

    /** @param array{rhythm: CourseRhythm, starts_on: string, start_hour: int, skipped_dates: list<string>} $data */
    public function handle(CourseCohort $cohort, array $data): CourseCohort
    {
        return DB::transaction(function () use ($cohort, $data): CourseCohort {
            $cohort = CourseCohort::query()->lockForUpdate()->findOrFail($cohort->id);
            if ($cohort->isCancelled()) {
                throw ValidationException::withMessages(['starts_on' => __('courses.schedule_locked', [], 'fr')]);
            }

            $past = $cohort->sessions()->where('starts_at', '<=', now())->orderBy('position')->get();
            $minutesDone = (int) $past->whereNull('cancelled_at')->sum('duration_minutes');
            $remainingHours = intdiv((int) config('courses.total_hours') * 60 - $minutesDone, 60);
            if ($remainingHours <= 0) {
                throw ValidationException::withMessages(['starts_on' => __('courses.schedule_complete', [], 'fr')]);
            }

            $sessions = $this->schedule->handle(
                $data['rhythm'],
                $data['starts_on'],
                $data['start_hour'],
                $data['skipped_dates'],
                $remainingHours,
            );
            if ($sessions === [] || ! $sessions[0]['starts_at']->isFuture()) {
                throw ValidationException::withMessages(['starts_on' => __('courses.schedule_starts_on_invalid', [], 'fr')]);
            }

            $cohort->sessions()->where('starts_at', '>', now())->delete();
            $position = (int) $past->max('position');
            $cohort->sessions()->createMany(array_map(function (array $session) use (&$position): array {
                $position++;

                return [
                    'position' => $position,
                    'starts_at' => $session['starts_at'],
                    'duration_minutes' => $session['duration_minutes'],
                ];
            }, $sessions));

            $first = $cohort->sessions()->orderBy('starts_at')->first();
            $last = $cohort->sessions()->orderByDesc('starts_at')->first();
            $cohort->update([
                'rhythm' => $data['rhythm'],
                'starts_at' => $first?->starts_at ?? $cohort->starts_at,
                'ends_at' => $last?->endsAt() ?? $cohort->ends_at,
            ]);

            $students = User::query()->whereHas('courseEnrollments', fn ($query) => $query
                ->where('course_cohort_id', $cohort->id)
                ->where('status', CourseEnrollmentStatus::Confirmed))->get();
            Notification::send($students, new CourseScheduleChanged($cohort->refresh()));

            return $cohort;
        });
    }
}
