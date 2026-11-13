<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\CourseInstallmentStatus;
use App\Models\CourseEnrollment;
use App\Models\CourseInstallment;
use App\Notifications\CourseInstallmentFailed;
use App\Services\CoursePaymentGateway;
use Stripe\Exception\CardException;
use Throwable;

/**
 * Takes one due instalment from the card saved at enrollment. A declined charge is recorded, the student is
 * emailed (unless the teacher triggered the retry themselves) and the next automatic attempt is planned.
 */
final readonly class ChargeCourseInstallment
{
    public function __construct(
        private CoursePaymentGateway $gateway,
        private UpdateCourseInstallmentPaid $markPaid,
        private CreateTrialPaymentAlert $alert,
    ) {}

    public function handle(CourseInstallment $installment, bool $notifyStudent = true): bool
    {
        $installment->loadMissing('enrollment.user', 'enrollment.cohort');
        $enrollment = $installment->enrollment;
        if ($installment->stripe_session_id && ! $this->closePaymentPage($installment)) {
            return $installment->refresh()->status === CourseInstallmentStatus::Paid;
        }
        [$customerId, $paymentMethodId] = $this->savedCard($enrollment);
        if ($customerId === null || $paymentMethodId === null) {
            $this->fail($installment, 'Aucune carte enregistrée pour le prélèvement automatique.', $notifyStudent);

            return false;
        }
        $installment->update(['attempts' => $installment->attempts + 1]);
        try {
            $paymentIntent = $this->gateway->chargeInstallment($installment, $customerId, $paymentMethodId);
        } catch (CardException $exception) {
            $this->fail($installment, $this->reason($exception->getDeclineCode() ?? $exception->getStripeCode()), $notifyStudent);

            return false;
        } catch (Throwable $exception) {
            // Stripe unreachable: not the student's fault, try again in an hour without telling them.
            report($exception);
            $installment->update(['next_attempt_at' => now()->addHour()]);

            return false;
        }
        if (($paymentIntent['status'] ?? '') !== 'succeeded') {
            $this->fail($installment, $this->reason('authentication_required'), $notifyStudent);

            return false;
        }

        return $this->markPaid->handle($installment, (string) $paymentIntent['id']);
    }

    /**
     * The student may have opened the instalment's payment page: close it before charging the saved card, so the
     * instalment can never be paid twice. A page already paid simply settles the instalment.
     */
    private function closePaymentPage(CourseInstallment $installment): bool
    {
        try {
            $session = $this->gateway->expireSession((string) $installment->stripe_session_id);
        } catch (Throwable $exception) {
            report($exception);
            $installment->update(['next_attempt_at' => now()->addHour()]);

            return false;
        }
        if (($session['payment_status'] ?? '') === 'paid' && is_string($session['payment_intent'] ?? null)) {
            $this->markPaid->handle($installment, $session['payment_intent']);

            return false;
        }
        $installment->update(['stripe_session_id' => null, 'checkout_url' => null]);

        return true;
    }

    /** @return array{0: ?string, 1: ?string} */
    private function savedCard(CourseEnrollment $enrollment): array
    {
        if ($enrollment->stripe_customer_id && $enrollment->stripe_payment_method_id) {
            return [$enrollment->stripe_customer_id, $enrollment->stripe_payment_method_id];
        }
        $firstPayment = $enrollment->installments()->whereNotNull('stripe_payment_intent_id')->orderBy('position')->first();
        if (! $firstPayment) {
            return [$enrollment->stripe_customer_id, null];
        }
        try {
            $paymentIntent = $this->gateway->paymentIntent($firstPayment->stripe_payment_intent_id);
        } catch (Throwable $exception) {
            report($exception);

            return [$enrollment->stripe_customer_id, null];
        }
        $enrollment->update([
            'stripe_customer_id' => $enrollment->stripe_customer_id ?? (is_string($paymentIntent['customer'] ?? null) ? $paymentIntent['customer'] : null),
            'stripe_payment_method_id' => is_string($paymentIntent['payment_method'] ?? null) ? $paymentIntent['payment_method'] : null,
        ]);

        return [$enrollment->stripe_customer_id, $enrollment->stripe_payment_method_id];
    }

    /** The bank's answer in plain French: Stripe's own messages are in English and meant for developers. */
    private function reason(?string $code): string
    {
        return match ($code) {
            'authentication_required' => 'Ta banque demande de valider ce paiement (3D Secure) : il ne peut pas être prélevé automatiquement.',
            'insufficient_funds' => 'Solde insuffisant sur la carte.',
            'expired_card' => 'La carte enregistrée a expiré.',
            'lost_card', 'stolen_card', 'pickup_card' => 'La carte enregistrée a été bloquée par ta banque.',
            'incorrect_cvc', 'incorrect_number', 'invalid_cvc', 'invalid_expiry_month', 'invalid_expiry_year' => 'Les informations de la carte enregistrée ne sont plus valides.',
            default => 'Ta banque a refusé le prélèvement.',
        };
    }

    private function fail(CourseInstallment $installment, string $reason, bool $notifyStudent): void
    {
        $retryDays = config('courses.installments.retry_days');
        $nextRetryInDays = $retryDays[max(0, $installment->attempts - 1)] ?? null;
        $installment->update([
            'status' => CourseInstallmentStatus::Failed,
            'failure_message' => mb_substr($reason, 0, 255),
            'next_attempt_at' => $nextRetryInDays !== null ? now()->addDays((int) $nextRetryInDays) : null,
        ]);
        if ($notifyStudent) {
            $installment->enrollment->user->notify(new CourseInstallmentFailed($installment));
        }
        if ($nextRetryInDays === null) {
            $this->alert->handle(null, 'l’échéance '.$installment->position.' du parcours de '.$installment->enrollment->user->name
                .' reste impayée après plusieurs tentatives (inscription '.$installment->course_enrollment_id.'). Contacte l’élève.');
        }
    }
}
