<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\TrialReservation;
use App\Notifications\Concerns\DescribesTrialSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Sent to the student when a payment could not be kept (slot given to someone else, or after a manual review). */
final class TrialRefunded extends Notification implements ShouldQueue
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
            ->subject('Ton paiement a été remboursé')
            ->greeting('Bonjour '.$this->plain($notifiable->name).',')
            ->line('Nous n’avons pas pu confirmer ton cours d’essai du '.$this->sessionDate($this->reservation, $notifiable).' : le créneau n’était plus disponible.')
            ->line('Tu as été remboursé intégralement. Le montant apparaît sous quelques jours selon ta banque.')
            ->action('Choisir un autre créneau', route('trial-reservations.create'))
            ->salutation($this->signature());
    }
}
