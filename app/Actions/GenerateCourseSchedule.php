<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\CourseRhythm;
use Carbon\CarbonImmutable;

/**
 * Lays a course's hours on the rhythm's weekdays, at the chosen hour in the school's time zone (so sessions
 * keep their local hour across daylight saving changes), skipping the days off. Used when a group is created
 * and when its remaining schedule is replanned.
 */
final readonly class GenerateCourseSchedule
{
    /**
     * @param  list<string>  $skippedDates
     * @return list<array{starts_at: CarbonImmutable, duration_minutes: int}>
     */
    public function handle(CourseRhythm $rhythm, string $startsOn, int $startHour, array $skippedDates = [], ?int $totalHours = null): array
    {
        $timezone = (string) config('trials.timezone');
        $remainingHours = $totalHours ?? (int) config('courses.total_hours');
        $day = CarbonImmutable::parse($startsOn, $timezone)->startOfDay();
        $sessions = [];

        while ($remainingHours > 0) {
            if (in_array($day->dayOfWeekIso, $rhythm->weekdays(), true) && ! in_array($day->toDateString(), $skippedDates, true)) {
                $hours = min($rhythm->sessionHours(), $remainingHours);
                $sessions[] = ['starts_at' => $day->setTime($startHour, 0)->utc(), 'duration_minutes' => $hours * 60];
                $remainingHours -= $hours;
            }
            $day = $day->addDay();
        }

        return $sessions;
    }
}
