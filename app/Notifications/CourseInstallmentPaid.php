<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\CourseInstallment;
use App\Notifications\Concerns\DescribesTrialSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Receipt of an instalment paid after the enrollment (the first one is confirmed by the enrollment email). */
final class CourseInstallmentPaid extends Notification implements ShouldQueue
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
        $count = $enrollment->installments()->count();
        $remaining = $enrollment->installments()->where('status', '!=', 'paid')->count();

        return (new MailMessage)
            ->subject('Échéance '.$this->installment->position.'/'.$count.' de ton parcours réglée')
            ->greeting('Bonjour '.$this->plain($notifiable->name).',')
            ->line('Nous avons bien reçu l’échéance '.$this->installment->position.'/'.$count.' de ton parcours '.$enrollment->cohort->level->label()
                .' : '.number_format($this->installment->amount_cents / 100, 2, ',', ' ').' €.')
            ->line($remaining === 0 ? 'Ton parcours est entièrement réglé. Merci !' : 'Il te reste '.$remaining.' échéance(s), prélevée(s) automatiquement.')
            ->action('Voir mon parcours', route('course-enrollments.index'))
            ->salutation($this->signature());
    }
}
