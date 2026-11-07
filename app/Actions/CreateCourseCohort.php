<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\CourseFormat;
use App\Enums\CourseLevel;
use App\Enums\CourseRhythm;
use App\Models\CourseCohort;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

/**
 * The teacher opens a group: its 60 hours are laid out from the start date on the rhythm's weekdays, at the
 * chosen hour in the school's time zone (so sessions keep their local hour across daylight saving changes),
 * skipping the days off. The price is copied from the catalog at creation.
 */
final readonly class CreateCourseCohort
{
    /**
     * @param  array{level: CourseLevel, format: CourseFormat, rhythm: CourseRhythm, starts_on: string, start_hour: int, capacity: int, skipped_dates: list<string>}  $data
     */
    public function handle(array $data): CourseCohort
    {
        $sessions = $this->schedule($data['rhythm'], $data['starts_on'], $data['start_hour'], $data['skipped_dates']);
        $last = end($sessions);

        return DB::transaction(function () use ($data, $sessions, $last): CourseCohort {
            $cohort = CourseCohort::query()->create([
                'level' => $data['level'],
                'format' => $data['format'],
                'rhythm' => $data['rhythm'],
                'starts_at' => $sessions[0]['starts_at'],
                'ends_at' => $last['starts_at']->addMinutes($last['duration_minutes']),
                'capacity' => $data['format'] === CourseFormat::Solo ? 1 : $data['capacity'],
                'price_cents' => $data['level']->priceCents($data['format']),
                'currency' => config('courses.currency'),
                'is_published' => true,
            ]);
            $cohort->sessions()->createMany(array_map(fn (array $session, int $index): array => [
                'position' => $index + 1,
                'starts_at' => $session['starts_at'],
                'duration_minutes' => $session['duration_minutes'],
            ], $sessions, array_keys($sessions)));

            return $cohort;
        });
    }

    /**
     * @param  list<string>  $skippedDates
     * @return list<array{starts_at: CarbonImmutable, duration_minutes: int}>
     */
    public function schedule(CourseRhythm $rhythm, string $startsOn, int $startHour, array $skippedDates = []): array
    {
        $timezone = (string) config('trials.timezone');
        $remainingHours = (int) config('courses.total_hours');
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
