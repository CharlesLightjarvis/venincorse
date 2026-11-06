<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\PermissionEnum;
use App\Enums\TrialReservationStatus;
use App\Models\TrialReservation;
use App\Models\User;
use App\Notifications\TrialOutcomeReminder;
use Illuminate\Support\Facades\Notification;

/** Reminds the teaching team, once per session, to close past sessions that were never closed. */
final readonly class CreateTrialOutcomeReminders
{
    public function handle(): int
    {
        $teachers = User::permission(PermissionEnum::UpdateTrials->value)->get();
        $endedBefore = now()
            ->subMinutes((int) config('trials.duration_minutes'))
            ->subHours((int) config('trials.outcome_reminder_hours'));
        $sent = 0;

        TrialReservation::query()
            ->with(['slot', 'user'])
            ->whereIn('status', [TrialReservationStatus::Confirmed, TrialReservationStatus::Ended])
            ->whereNull('outcome_reminder_sent_at')
            ->whereHas('slot', fn ($slot) => $slot->where('starts_at', '<=', $endedBefore))
            ->lazyById()
            ->each(function (TrialReservation $reservation) use ($teachers, &$sent): void {
                $claimed = TrialReservation::query()->whereKey($reservation->id)
                    ->whereNull('outcome_reminder_sent_at')
                    ->update(['outcome_reminder_sent_at' => now()]);
                if ($claimed > 0) {
                    Notification::send($teachers, new TrialOutcomeReminder($reservation));
                    $sent++;
                }
            });

        return $sent;
    }
}
