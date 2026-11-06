<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\TrialReservationStatus;
use App\Models\TrialReservation;
use App\Notifications\TrialReminder;

/**
 * Reminds each student once, the day before their paid session. A student who paid only a few hours ago just got
 * the confirmation email, so their reminder waits a little. Safe to run as often as needed.
 */
final readonly class CreateTrialReminders
{
    public function handle(): int
    {
        $sent = 0;
        TrialReservation::query()
            ->with(['slot', 'user'])
            ->where('status', TrialReservationStatus::Confirmed)
            ->whereNull('reminder_sent_at')
            ->where('paid_at', '<=', now()->subHours((int) config('trials.reminder_min_hours_after_payment')))
            ->whereHas('slot', fn ($slot) => $slot
                ->where('starts_at', '>', now())
                ->where('starts_at', '<=', now()->addHours((int) config('trials.reminder_hours'))))
            ->lazyById()
            ->each(function (TrialReservation $reservation) use (&$sent): void {
                $claimed = TrialReservation::query()->whereKey($reservation->id)
                    ->whereNull('reminder_sent_at')
                    ->update(['reminder_sent_at' => now()]);
                if ($claimed > 0) {
                    $reservation->user->notify(new TrialReminder($reservation));
                    $sent++;
                }
            });

        return $sent;
    }
}
