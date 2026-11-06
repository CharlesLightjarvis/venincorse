<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\TrialReservationStatus;
use App\Models\TrialReservation;

/**
 * Moves every paid session whose end time has passed from `confirmed` to `ended`, so a status always
 * means one thing: `confirmed` is still to come or under way, `ended` is over and waits to be closed.
 */
final readonly class UpdateEndedTrialSessions
{
    public function handle(): int
    {
        $endedBefore = now()->subMinutes((int) config('trials.duration_minutes'));

        return TrialReservation::query()
            ->where('status', TrialReservationStatus::Confirmed)
            ->whereHas('slot', fn ($slot) => $slot->where('starts_at', '<=', $endedBefore))
            ->update(['status' => TrialReservationStatus::Ended]);
    }
}
