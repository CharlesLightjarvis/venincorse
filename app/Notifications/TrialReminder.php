<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\TrialReservation;
use App\Notifications\Concerns\DescribesTrialSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Sent to the student the day before their paid session. */
final class TrialReminder extends Notification implements ShouldQueue
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
            ->subject('Rappel : ton cours d’essai approche')
            ->greeting('Bonjour '.$this->plain($notifiable->name).',')
            ->line('Petit rappel : ton cours d’essai a lieu bientôt.')
            ->line('**Quand :** '.$this->sessionDate($this->reservation, $notifiable))
            ->line('Garde ton objectif en tête : « '.$this->plain($this->reservation->goal).' ».');

        return ($this->reservation->meeting_url
            ? $message->action('Rejoindre la séance', $this->reservation->meeting_url)
            : $message
                ->line('Le lien de la visio arrive bientôt : tu le recevras par email.')
                ->action('Voir mon cours d’essai', route('trial-reservations.index')))
            ->salutation($this->signature());
    }
}
