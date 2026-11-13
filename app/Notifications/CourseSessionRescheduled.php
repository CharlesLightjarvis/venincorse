<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\CourseSession;
use App\Notifications\Concerns\DescribesTrialSession;
use Carbon\CarbonImmutable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** One session of the student's course moved to another date or hour. */
final class CourseSessionRescheduled extends Notification implements ShouldQueue
{
    use DescribesTrialSession, Queueable;

    public function __construct(public CourseSession $session, public CarbonImmutable $previousStartsAt)
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
            ->subject('Ta séance '.$session->position.' a été déplacée — parcours '.strtoupper($session->cohort->level->value))
            ->greeting('Bonjour '.$this->plain($notifiable->name).',')
            ->line('La séance '.$session->position.' de ton parcours '.$session->cohort->level->label().' a été déplacée par ton professeur.')
            ->line('**Ancienne date :** '.$this->courseSessionDate($this->previousStartsAt, $notifiable))
            ->line('**Nouvelle date :** '.$this->courseSessionDate($session->starts_at, $notifiable))
            ->action('Voir mon planning', route('course-enrollments.index'))
            ->salutation($this->signature());
    }
}
