<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\CourseSession;
use App\Notifications\Concerns\DescribesTrialSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** A session now has its own visio link, different from the group's default one. */
final class CourseSessionMeetingLinkShared extends Notification implements ShouldQueue
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
            ->subject('Le lien visio de ta séance '.$session->position.' — parcours '.strtoupper($session->cohort->level->value))
            ->greeting('Bonjour '.$this->plain($notifiable->name).',')
            ->line('Un lien de visio propre à la séance '.$session->position.' de ton parcours '.$session->cohort->level->label().' vient d’être ajouté ou modifié.')
            ->line('**Séance :** '.$this->courseSessionDate($session->starts_at, $notifiable))
            ->action('Rejoindre la visio', (string) $session->meeting_url)
            ->line('Tu le retrouves aussi dans le planning de « Mes parcours ».')
            ->salutation($this->signature());
    }
}
