<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\CourseEnrollment;
use App\Notifications\Concerns\DescribesTrialSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Tells the student their enrollment ended, why, and what was refunded. */
final class CourseEnrollmentCancelled extends Notification implements ShouldQueue
{
    use DescribesTrialSession, Queueable;

    public function __construct(public CourseEnrollment $enrollment, public int $refundCents)
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
        $message = (new MailMessage)
            ->subject('Ton inscription au parcours '.strtoupper($this->enrollment->cohort->level->value).' est annulée')
            ->greeting('Bonjour '.$this->plain($notifiable->name).',')
            ->line('Ton inscription au parcours '.$this->enrollment->cohort->level->label().' est annulée.')
            ->line('**Motif :** '.$this->enrollment->cancellation_reason);

        if ($this->refundCents > 0) {
            $refund = '**Remboursement :** '.number_format($this->refundCents / 100, 2, ',', ' ').' €';
            $message->line($this->enrollment->payment_method?->isManual()
                ? $refund.'. L’école te contactera pour les modalités du remboursement.'
                : $refund.', sur le moyen de paiement utilisé, sous quelques jours selon ta banque.');
        } else {
            $message->line('Aucun remboursement n’est prévu.');
        }

        return $message
            ->line('Les échéances restantes éventuelles ne seront pas prélevées.')
            ->action('Voir mes parcours', route('course-enrollments.index'))
            ->salutation($this->signature());
    }
}
