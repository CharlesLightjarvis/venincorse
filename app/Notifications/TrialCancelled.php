<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\TrialReservation;
use App\Notifications\Concerns\DescribesTrialSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Sent to the student when the teacher cancels a paid session; the payment has already been refunded. */
final class TrialCancelled extends Notification implements ShouldQueue
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
            ->subject('Ton cours d’essai est annulé et remboursé')
            ->greeting('Bonjour '.$this->plain($notifiable->name).',');

        $message = $this->reservation->cancelled_by === 'student'
            ? $message->line('C’est noté : ton cours d’essai du '.$this->sessionDate($this->reservation, $notifiable).' est annulé.')
            : $message
                ->line('Nous sommes désolés : ton cours d’essai du '.$this->sessionDate($this->reservation, $notifiable).' a dû être annulé.')
                ->line('**Motif :** '.$this->reservation->cancellation_reason);

        return $message
            ->line('Tu as été remboursé intégralement. Le montant apparaît sous quelques jours selon ta banque.')
            ->line('Tu peux réserver un nouveau créneau quand tu le souhaites.')
            ->action('Choisir un nouveau créneau', route('trial-reservations.create'))
            ->salutation($this->signature());
    }
}
