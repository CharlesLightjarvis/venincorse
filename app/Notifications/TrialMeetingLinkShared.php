<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\TrialReservation;
use App\Notifications\Concerns\DescribesTrialSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Sent to the student when the teacher adds or changes the visio link of a paid session. */
final class TrialMeetingLinkShared extends Notification implements ShouldQueue
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
            ->subject('Le lien de ton cours d’essai est prêt')
            ->greeting('Bonjour '.$this->plain($notifiable->name).',')
            ->line('Ton professeur a partagé le lien de la visio pour ton cours d’essai.')
            ->line('**Quand :** '.$this->sessionDate($this->reservation, $notifiable))
            ->action('Rejoindre la séance', (string) $this->reservation->meeting_url)
            ->line('Tu retrouveras aussi ce lien dans ton espace, rubrique « Ma réservation d’essai ».')
            ->salutation($this->signature());
    }
}
