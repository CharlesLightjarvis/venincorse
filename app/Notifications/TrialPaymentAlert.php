<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\TrialReservation;
use App\Notifications\Concerns\DescribesTrialSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Tells the teaching team that a payment needs a human decision: a review, a failed refund or a dispute. */
final class TrialPaymentAlert extends Notification implements ShouldQueue
{
    use DescribesTrialSession, Queueable;

    public function __construct(public ?TrialReservation $reservation, public string $reason)
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
            ->subject('À vérifier : paiement d’un cours d’essai')
            ->greeting('Bonjour '.$this->plain($notifiable->name).',')
            ->line('Un paiement de cours d’essai demande ton attention.')
            ->line('**Raison :** '.$this->reason);

        if ($this->reservation) {
            $message->line('**Élève :** '.$this->plain($this->reservation->user->name))
                ->line('**Séance :** '.$this->sessionDate($this->reservation, $notifiable));
        }

        return $message
            ->action('Voir l’essai', $this->reservation
                ? route('trial-management.show', $this->reservation)
                : route('trial-management.index'))
            ->salutation($this->signature());
    }
}
