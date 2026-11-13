<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\CourseSession;
use App\Notifications\Concerns\DescribesTrialSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** The teacher cancelled one session of the student's course. */
final class CourseSessionCancelled extends Notification implements ShouldQueue
{
    use DescribesTrialSession, Queueable;

    public function __construct(public CourseSession $session)
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
        $session = $this->session->loadMissing('cohort');

        return (new MailMessage)
            ->subject('La séance '.$session->position.' est annulée — parcours '.strtoupper($session->cohort->level->value))
            ->greeting('Bonjour '.$this->plain($notifiable->name).',')
            ->line('La séance '.$session->position.' de ton parcours '.$session->cohort->level->label().' est annulée.')
            ->line('**Séance prévue :** '.$this->courseSessionDate($session->starts_at, $notifiable))
            ->line('**Motif :** '.$this->plain($session->cancellation_reason))
            ->line('Ton professeur te communiquera une nouvelle date si la séance est reportée.')
            ->action('Voir mes parcours', route('course-enrollments.index'))
            ->salutation($this->signature());
    }
}
