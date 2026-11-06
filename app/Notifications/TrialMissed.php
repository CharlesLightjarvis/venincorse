<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\TrialReservation;
use App\Notifications\Concerns\DescribesTrialSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Sent to the student when the teacher records that they did not attend. */
final class TrialMissed extends Notification implements ShouldQueue
{
    use DescribesTrialSession, Queueable;

    public function __construct(public TrialReservation $reservation)
    {
        $this->afterCommit();
    }

    /** @return list<string> */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('On s’est manqués')
            ->greeting('Bonjour '.$this->plain($notifiable->name).',')
            ->line('Ton professeur t’attendait pour ton cours d’essai du '.$this->sessionDate($this->reservation, $notifiable).', mais nous ne t’avons pas vu.')
            ->line('Un empêchement ? Écris-nous : nous verrons ensemble ce qui est possible.')
            ->action('Nous contacter', route('contact'))
            ->salutation($this->signature());
    }
}
