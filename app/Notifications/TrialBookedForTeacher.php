<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\TrialReservation;
use App\Notifications\Concerns\DescribesTrialSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Sent to the people who prepare trials, so a paid session never goes unnoticed. */
final class TrialBookedForTeacher extends Notification implements ShouldQueue
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
            ->subject('Nouveau cours d’essai : '.$this->reservation->user->name)
            ->greeting('Bonjour '.$this->plain($notifiable->name).',')
            ->line($this->plain($this->reservation->user->name).' a réservé et payé un cours d’essai.')
            ->line('**Quand :** '.$this->sessionDate($this->reservation, $notifiable))
            ->line('**Objectif :** '.$this->plain($this->reservation->goal))
            ->line('Pense à ajouter le lien de la visio : l’élève le recevra par email.')
            ->action('Préparer la séance', route('trial-management.show', $this->reservation))
            ->salutation($this->signature());
    }
}
