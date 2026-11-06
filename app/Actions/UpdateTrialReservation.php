<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\TrialReservationStatus;
use App\Models\TrialReservation;
use App\Notifications\TrialMeetingLinkShared;

/** Saves the teacher's preparation; the student is emailed whenever the visio link of a paid session changes. */
final readonly class UpdateTrialReservation
{
    /** @param array{notes?: ?string, meeting_url?: ?string} $attributes */
    public function handle(TrialReservation $reservation, array $attributes): TrialReservation
    {
        $reservation->update($attributes);

        if ($reservation->wasChanged('meeting_url')
            && filled($reservation->meeting_url)
            && $reservation->status === TrialReservationStatus::Confirmed) {
            $reservation->loadMissing(['slot', 'user'])->user->notify(new TrialMeetingLinkShared($reservation));
        }

        return $reservation;
    }
}
