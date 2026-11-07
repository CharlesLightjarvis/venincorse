<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\CourseEnrollment;
use App\Notifications\Concerns\DescribesTrialSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Sent when a payment could not keep a seat (group full or already started) and was refunded in full. */
final class CourseEnrollmentRefunded extends Notification implements ShouldQueue
{
    use DescribesTrialSession, Queueable;

    public function __construct(public CourseEnrollment $enrollment)
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
            ->line('Ton paiement pour le parcours '.$this->enrollment->cohort->level->label().' est arrivé après la fin du délai de réservation, et le groupe n’avait plus de place disponible.')
            ->line('Nous l’avons remboursé intégralement. Le remboursement apparaît sous quelques jours selon ta banque.')
            ->action('Voir les autres groupes', route('course-enrollments.create', ['level' => $this->enrollment->cohort->level->value]))
            ->salutation($this->signature());
    }
}
