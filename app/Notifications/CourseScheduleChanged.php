<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\CourseCohort;
use App\Models\CourseSession;
use App\Notifications\Concerns\DescribesTrialSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** The remaining schedule of the student's group was replanned. */
final class CourseScheduleChanged extends Notification implements ShouldQueue
{
    use DescribesTrialSession, Queueable;

    public function __construct(public CourseCohort $cohort)
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
        $cohort = $this->cohort->loadMissing('sessions');
        $next = $cohort->sessions
            ->first(fn (CourseSession $session): bool => ! $session->isCancelled() && $session->starts_at->isFuture());

        $message = (new MailMessage)
            ->subject('Le planning de ton parcours '.strtoupper($cohort->level->value).' a changé')
            ->greeting('Bonjour '.$this->plain($notifiable->name).',')
            ->line('Les séances à venir de ton parcours '.$cohort->level->label().' ont été replanifiées par ton professeur.');

        if ($next) {
            $message->line('**Prochaine séance :** '.$this->courseSessionDate($next->starts_at, $notifiable));
        }

        return $message
            ->line('Le calendrier de « Mes parcours » est à jour.')
            ->action('Voir mon planning', route('course-enrollments.index'))
            ->salutation($this->signature());
    }
}
