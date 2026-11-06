<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\TrialReservation;
use App\Notifications\Concerns\DescribesTrialSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Tells the teaching team that a student moved or cancelled their paid session. */
final class TrialChangedForTeacher extends Notification implements ShouldQueue
{
    use DescribesTrialSession, Queueable;

    public function __construct(public TrialReservation $reservation, public bool $cancelled)
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
        $student = $this->reservation->user->name;
        $message = (new MailMessage)->greeting('Bonjour '.$this->plain($notifiable->name).',');

        $message = $this->cancelled
            ? $message
                ->subject('Cours d’essai annulé par '.$student)
                ->line($this->plain($student).' a annulé son cours d’essai du '.$this->sessionDate($this->reservation, $notifiable).'. Il a été remboursé et le créneau est de nouveau libre.')
            : $message
                ->subject('Cours d’essai déplacé par '.$student)
                ->line($this->plain($student).' a déplacé son cours d’essai.')
                ->line('**Nouveau rendez-vous :** '.$this->sessionDate($this->reservation, $notifiable))
                ->line('L’ancien lien de visio a été retiré : ajoute celui de la nouvelle séance pour que l’élève le reçoive.');

        return $message
            ->action('Voir l’essai', route('trial-management.show', $this->reservation))
            ->salutation($this->signature());
    }
}
