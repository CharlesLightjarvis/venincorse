<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\TrialReservation;
use App\Notifications\Concerns\DescribesTrialSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Sent to the student when the teacher offers a free new slot after a missed session. */
final class TrialRebookOffered extends Notification implements ShouldQueue
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
            ->subject('Un nouveau créneau t’est offert')
            ->greeting('Bonjour '.$this->plain($notifiable->name).',')
            ->line('Bonne nouvelle : ton professeur t’offre un nouveau créneau pour ton cours d’essai, sans frais.')
            ->line('Choisis l’horaire qui te convient parmi les créneaux disponibles, avant le '
                .$this->reservation->rebookOfferExpiresAt()?->locale('fr')->isoFormat('D MMMM YYYY').'.')
            ->line('Ce nouveau créneau ne pourra plus être déplacé ni remboursé : choisis-le bien.')
            ->action('Choisir mon nouveau créneau', route('trial-reschedules.create', $this->reservation))
            ->salutation($this->signature());
    }
}
