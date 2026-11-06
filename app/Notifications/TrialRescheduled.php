<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\TrialReservation;
use App\Notifications\Concerns\DescribesTrialSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Sent to the student after moving their session to a new slot. */
final class TrialRescheduled extends Notification implements ShouldQueue
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
            ->subject('Ton cours d’essai a été déplacé')
            ->greeting('Bonjour '.$this->plain($notifiable->name).',')
            ->line('C’est noté : ton cours d’essai est déplacé.')
            ->line('**Nouveau rendez-vous :** '.$this->sessionDate($this->reservation, $notifiable))
            ->line('Rien d’autre à payer. Ton professeur t’enverra le lien de la visio par email avant la séance.')
            ->action('Voir mon cours d’essai', route('trial-reservations.index'))
            ->salutation($this->signature());
    }
}
