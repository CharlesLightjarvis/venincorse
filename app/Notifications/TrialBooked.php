<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\TrialReservation;
use App\Notifications\Concerns\DescribesTrialSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Sent to the student once the payment is verified and the slot is theirs. */
final class TrialBooked extends Notification implements ShouldQueue
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
            ->subject('Ton cours d’essai est confirmé')
            ->greeting('Bonjour '.$this->plain($notifiable->name).',')
            ->line('Ton paiement est vérifié : ton cours d’essai d’une heure est réservé.')
            ->line('**Quand :** '.$this->sessionDate($this->reservation, $notifiable))
            ->line('**Durée :** '.config('trials.duration_minutes').' minutes, en visio');

        $message = $this->reservation->meeting_url
            ? $message->line('Le lien de la visio est déjà prêt : retrouve-le dans ton espace.')
            : $message->line('Ton professeur ajoutera le lien de la visio avant la séance. Tu recevras un email dès qu’il sera disponible.');

        return $message
            ->action('Voir mon cours d’essai', route('trial-reservations.index'))
            ->salutation($this->signature());
    }
}
