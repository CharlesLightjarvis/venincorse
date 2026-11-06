<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\PermissionEnum;
use App\Models\TrialReservation;
use App\Models\User;
use App\Notifications\TrialBooked;
use App\Notifications\TrialBookedForTeacher;
use Illuminate\Support\Facades\Notification;

/** Tells the student their trial is booked and the teaching team that a session needs preparing (queued, never blocking). */
final readonly class CreateTrialBookedNotifications
{
    public function handle(TrialReservation $reservation): void
    {
        $reservation->loadMissing(['slot', 'user']);
        $reservation->user->notify(new TrialBooked($reservation));
        Notification::send(
            User::permission(PermissionEnum::UpdateTrials->value)->get(),
            new TrialBookedForTeacher($reservation),
        );
    }
}
