<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\PermissionEnum;
use App\Models\TrialReservation;
use App\Models\User;
use App\Notifications\TrialPaymentAlert;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

/** Logs a payment problem and emails the people who manage trials, so it never stays unnoticed. */
final readonly class CreateTrialPaymentAlert
{
    public function handle(?TrialReservation $reservation, string $reason): void
    {
        Log::warning('Trial payment needs attention: '.$reason, ['reservation' => $reservation?->id]);

        Notification::send(
            User::permission(PermissionEnum::UpdateTrials->value)->get(),
            new TrialPaymentAlert($reservation?->loadMissing(['slot', 'user']), $reason),
        );
    }
}
