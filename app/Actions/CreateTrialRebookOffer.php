<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\TrialReservationStatus;
use App\Models\TrialReservation;
use App\Notifications\TrialRebookOffered;

/** After a missed session, the teacher may offer the student one free new slot (a goodwill gesture). */
final readonly class CreateTrialRebookOffer
{
    public function handle(TrialReservation $reservation): bool
    {
        if (! $reservation->canReceiveRebookOffer()) {
            return false;
        }
        $offered = TrialReservation::query()->whereKey($reservation->id)
            ->where('status', TrialReservationStatus::NoShow)
            ->whereNull('rebook_offered_at')
            ->update(['rebook_offered_at' => now()]) > 0;

        if ($offered) {
            $reservation->refresh()->load(['slot', 'user'])->user->notify(new TrialRebookOffered($reservation));
        }

        return $offered;
    }
}
