<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\CourseEnrollment;
use App\Notifications\Concerns\DescribesTrialSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Tells the people who manage the courses that a student joined a group. */
final class CourseEnrolledForTeacher extends Notification implements ShouldQueue
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
        $cohort = $this->enrollment->cohort;

        return (new MailMessage)
            ->subject('Nouvelle inscription : '.$this->enrollment->user->name.' en '.strtoupper($cohort->level->value))
            ->greeting('Bonjour '.$this->plain($notifiable->name).',')
            ->line($this->plain($this->enrollment->user->name).' s’est inscrit et a payé le parcours '.$cohort->level->label().' ('.$cohort->format->label().').')
            ->line('**Début :** '.$this->courseDate($this->enrollment, $cohort->starts_at, $notifiable))
            ->line('**Objectif :** '.$this->plain($this->enrollment->goal))
            ->line('**Places restantes :** '.$cohort->seatsLeft().' sur '.$cohort->capacity)
            ->action('Voir le groupe', route('course-cohorts.show', $cohort))
            ->salutation($this->signature());
    }
}
