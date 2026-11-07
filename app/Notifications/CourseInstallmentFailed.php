<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\CourseInstallment;
use App\Notifications\Concerns\DescribesTrialSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** The automatic charge of an instalment did not go through: the student can pay it themselves in one click. */
final class CourseInstallmentFailed extends Notification implements ShouldQueue
{
    use DescribesTrialSession, Queueable;

    public function __construct(public CourseInstallment $installment)
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
        $enrollment = $this->installment->enrollment;
        $message = (new MailMessage)
            ->subject('Ton échéance de parcours n’a pas pu être prélevée')
            ->greeting('Bonjour '.$this->plain($notifiable->name).',')
            ->line('Le prélèvement de l’échéance '.$this->installment->position.' de ton parcours '.$enrollment->cohort->level->label()
                .' ('.number_format($this->installment->amount_cents / 100, 2, ',', ' ').' €) n’a pas abouti.')
            ->line('**Raison indiquée par la banque :** '.$this->plain($this->installment->failure_message));

        $message = $this->installment->next_attempt_at
            ? $message->line('Nous réessaierons automatiquement le '
                .$this->installment->next_attempt_at->setTimezone($enrollment->timezone)->locale('fr')->isoFormat('D MMMM')
                .'. Tu peux aussi la régler dès maintenant, avec la carte de ton choix.')
            : $message->line('C’était la dernière tentative automatique : règle-la dès maintenant pour garder ta place dans le groupe.');

        return $message
            ->action('Régler l’échéance', route('course-enrollments.index'))
            ->salutation($this->signature());
    }
}
