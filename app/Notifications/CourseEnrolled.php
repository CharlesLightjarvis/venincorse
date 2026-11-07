<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\CourseEnrollment;
use App\Notifications\Concerns\DescribesTrialSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Sent to the student once the payment is verified and the seat is theirs; it also confirms the contract terms. */
final class CourseEnrolled extends Notification implements ShouldQueue
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
            ->subject('Ton inscription au parcours '.strtoupper($cohort->level->value).' est confirmée')
            ->greeting('Bonjour '.$this->plain($notifiable->name).',')
            ->line('Ton paiement est vérifié : ta place dans le parcours est réservée.')
            ->line('**Parcours :** '.$cohort->level->label().', '.$cohort->format->label().', rythme '.mb_strtolower($cohort->rhythm->label()))
            ->line('**Première séance :** '.$this->courseDate($this->enrollment, $cohort->starts_at, $notifiable))
            ->line('**Dernière séance :** '.$this->courseDate($this->enrollment, $cohort->ends_at, $notifiable))
            ->line($this->paymentLine())
            ->line('Le planning complet et le lien de la visio t’attendent dans ton espace.')
            ->line('**Droit de rétractation :** tu peux te rétracter sans justification jusqu’au '
                .$this->enrollment->withdrawalEndsAt()->setTimezone($this->enrollment->timezone)->locale('fr')->isoFormat('D MMMM YYYY')
                .', en nous écrivant. Si le parcours a déjà commencé à ta demande, seule la part non suivie est remboursée. Passé ce délai, l’inscription n’est plus remboursable (voir nos conditions générales de vente).')
            ->action('Voir mon parcours', route('course-enrollments.index'))
            ->salutation($this->signature());
    }

    private function paymentLine(): string
    {
        $euros = fn (int $cents): string => number_format($cents / 100, 2, ',', ' ').' €';
        $amounts = $this->enrollment->payment_plan->amountsCents($this->enrollment->amount_cents);
        if (count($amounts) === 1) {
            return '**Montant payé :** '.$euros($amounts[0]);
        }
        $next = $this->enrollment->installments()->where('position', '>', 1)->get()
            ->map(fn ($installment): string => $euros($installment->amount_cents).' le '
                .$installment->due_at->setTimezone($this->enrollment->timezone)->locale('fr')->isoFormat('D MMMM YYYY'))
            ->implode(', ');

        return '**Paiement en '.count($amounts).' fois :** '.$euros($amounts[0]).' payés aujourd’hui, puis '.$next
            .', prélevés automatiquement sur ta carte (total '.$euros($this->enrollment->amount_cents).').';
    }
}
