<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\TrialReservation;
use App\Notifications\Concerns\DescribesTrialSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Sent to the student once the teacher closes the session as held, with the teacher's summary if any. */
final class TrialCompleted extends Notification implements ShouldQueue
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
        $message = (new MailMessage)
            ->subject('Merci pour ton cours d’essai')
            ->greeting('Bonjour '.$this->plain($notifiable->name).',')
            ->line('Merci pour ce cours d’essai, c’était un plaisir de faire ta connaissance.');

        if (filled($this->reservation->session_summary)) {
            $message = $message
                ->line('**Le bilan de ton professeur :**')
                ->line($this->reservation->session_summary);
        }

        return $message
            ->line('Pour continuer à progresser régulièrement, découvre nos parcours.')
            ->action('Découvrir les parcours', route('courses'))
            ->salutation($this->signature());
    }
}
