<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\TrialReservation;
use App\Notifications\Concerns\DescribesTrialSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Reminds the teaching team, once, to close a past session that was never closed. */
final class TrialOutcomeReminder extends Notification implements ShouldQueue
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
            ->subject('À clôturer : cours d’essai de '.$this->reservation->user->name)
            ->greeting('Bonjour '.$this->plain($notifiable->name).',')
            ->line('Le cours d’essai de '.$this->plain($this->reservation->user->name).' du '.$this->sessionDate($this->reservation, $notifiable).' n’est pas encore clôturé.')
            ->line('Indique s’il a eu lieu : l’élève recevra ton bilan, ou un message s’il était absent.')
            ->action('Clôturer la séance', route('trial-management.show', $this->reservation))
            ->salutation($this->signature());
    }
}
