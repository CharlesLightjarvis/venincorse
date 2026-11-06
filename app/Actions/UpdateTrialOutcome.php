<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\TrialReservationStatus;
use App\Models\TrialReservation;
use App\Notifications\TrialCompleted;
use App\Notifications\TrialMissed;

/**
 * Once a paid session has started, the teacher records whether it took place (with an optional summary
 * emailed to the student) or the student did not come (the student is emailed to get in touch).
 */
final readonly class UpdateTrialOutcome
{
    public function handle(TrialReservation $reservation, TrialReservationStatus $outcome, ?string $summary = null): bool
    {
        if (! $reservation->awaitsOutcome()
            || ! in_array($outcome, [TrialReservationStatus::Completed, TrialReservationStatus::NoShow], true)) {
            return false;
        }
        $updated = TrialReservation::query()->whereKey($reservation->id)
            ->whereIn('status', [TrialReservationStatus::Confirmed, TrialReservationStatus::Ended])
            ->update([
                'status' => $outcome,
                'session_summary' => $outcome === TrialReservationStatus::Completed ? $summary : null,
            ]) > 0;

        if ($updated) {
            $reservation->refresh()->load(['slot', 'user']);
            $reservation->user->notify($outcome === TrialReservationStatus::Completed
                ? new TrialCompleted($reservation)
                : new TrialMissed($reservation));
        }

        return $updated;
    }
}
