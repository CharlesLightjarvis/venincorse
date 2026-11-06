<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\TrialAvailability;
use App\Models\TrialSlot;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

/**
 * Aligns the bookable slots with the teacher's availability for the booking window.
 * Weekdays, hours and closed dates are read in the school's time zone (`trials.timezone`), so a slot keeps its
 * local hour across daylight saving changes; slots are stored in UTC.
 * Slots are never deleted: reservations keep their slot, and a slot leaving the schedule is only unpublished.
 */
final readonly class SyncTrialSlots
{
    /** @return array{published: int, withdrawn: int, booked_outside: int} */
    public function handle(?TrialAvailability $availability = null): array
    {
        $availability ??= TrialAvailability::current();
        $timezone = (string) config('trials.timezone');
        $earliest = CarbonImmutable::now('UTC')->addHours((int) config('trials.minimum_notice_hours'));
        $scheduled = [];

        for ($offset = 0; $offset < (int) config('trials.window_days'); $offset++) {
            $day = CarbonImmutable::now($timezone)->startOfDay()->addDays($offset);
            if (! in_array($day->dayOfWeek, $availability->weekdays, true)
                || in_array($day->toDateString(), $availability->closed_dates, true)) {
                continue;
            }
            foreach ($availability->hours as $hour) {
                $start = $day->setTime($hour, 0)->utc();
                $scheduled[$start->format('Y-m-d H:i:s')] = $start;
            }
        }
        $desired = array_filter($scheduled, fn (CarbonImmutable $start): bool => $start->gte($earliest));

        return DB::transaction(function () use ($desired, $scheduled): array {
            $published = 0;
            foreach ($desired as $start) {
                $slot = TrialSlot::query()->firstOrCreate(['starts_at' => $start], ['is_published' => true]);
                if ($slot->wasRecentlyCreated) {
                    $published++;
                } elseif (! $slot->is_published) {
                    $slot->update(['is_published' => true]);
                    $published++;
                }
            }

            $withdrawn = TrialSlot::query()
                ->where('is_published', true)
                ->where('starts_at', '>=', now())
                ->get()
                ->reject(fn (TrialSlot $slot): bool => isset($desired[$slot->starts_at->format('Y-m-d H:i:s')]))
                ->each(fn (TrialSlot $slot) => $slot->update(['is_published' => false]))
                ->count();

            $windowEnd = now()->addDays((int) config('trials.window_days'));
            $bookedOutside = TrialSlot::query()
                ->whereHas('hold')
                ->whereBetween('starts_at', [now(), $windowEnd])
                ->get()
                ->reject(fn (TrialSlot $slot): bool => isset($scheduled[$slot->starts_at->format('Y-m-d H:i:s')]))
                ->count();

            return ['published' => $published, 'withdrawn' => $withdrawn, 'booked_outside' => $bookedOutside];
        });
    }
}
