<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\CourseCohort;
use App\Notifications\Concerns\DescribesTrialSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** The visio link of the student's group is ready (or changed). */
final class CourseMeetingLinkShared extends Notification implements ShouldQueue
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
        return (new MailMessage)
            ->subject('Le lien de la visio de ton parcours '.strtoupper($this->cohort->level->value))
            ->greeting('Bonjour '.$this->plain($notifiable->name).',')
            ->line('Ton professeur a partagé le lien de la visio de ton groupe ('.$this->cohort->level->label().'). Il s’applique aux séances qui n’ont pas leur propre lien.')
            ->action('Rejoindre la visio', (string) $this->cohort->meeting_url)
            ->line('Tu le retrouves aussi à tout moment dans le planning de « Mes parcours ».')
            ->salutation($this->signature());
    }
}
