<?php

declare(strict_types=1);

namespace App\Notifications\Concerns;

use App\Models\TrialReservation;
use DateTimeInterface;
use Illuminate\Queue\Middleware\RateLimited;

/**
 * Shared by the trial emails: queued delivery with retries and a sending rate limit, the session date in
 * the recipient's time zone, and plain rendering of text typed by users.
 */
trait DescribesTrialSession
{
    public int $maxExceptions = 3;

    /** @var list<int> */
    public array $backoff = [60, 300];

    /** Being held back by the rate limit is not a failure: the email keeps trying for an hour. */
    public function retryUntil(): DateTimeInterface
    {
        return now()->addHour();
    }

    /** @return list<object> */
    public function middleware(object $notifiable, string $channel): array
    {
        return $channel === 'mail' ? [new RateLimited('mail')] : [];
    }

    /** The student sees their own time zone; the team sees the school's, so dates never shift between members. */
    protected function sessionDate(TrialReservation $reservation, object $notifiable): string
    {
        $isStudent = ($notifiable->id ?? null) === $reservation->user_id;
        $timezone = ($notifiable->timezone ?? null)
            ?? ($isStudent ? $reservation->timezone : null)
            ?? config('trials.timezone');

        return $reservation->slot->starts_at
            ->setTimezone($timezone)
            ->locale('fr')
            ->isoFormat('dddd D MMMM YYYY [à] HH:mm')
            .' ('.$timezone.')';
    }

    /** Text typed by users is shown as written: Markdown such as links or images is never interpreted. */
    protected function plain(?string $text): string
    {
        return (string) preg_replace('/([\\\\`*_{}\[\]()#+\-.!<>|~])/', '\\\\$1', (string) $text);
    }

    protected function signature(): string
    {
        return 'À très vite,'."\n".'L’équipe '.config('app.name');
    }
}
