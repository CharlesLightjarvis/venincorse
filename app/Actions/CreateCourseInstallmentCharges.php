<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\CourseEnrollmentStatus;
use App\Enums\CourseInstallmentStatus;
use App\Models\CourseEnrollment;
use App\Models\CourseInstallment;
use App\Notifications\CourseInstallmentFailed;
use App\Services\CoursePaymentGateway;
use App\Services\TrialReservationLock;
use Stripe\Exception\CardException;
use Throwable;

/**
 * Charges the due instalments of confirmed enrollments on the card saved at enrollment. A declined charge (or one
 * the bank wants the student to authenticate) emails the student a link to pay it themselves, and is retried
 * automatically a few days later; after the last retry the teaching team is alerted. Safe to run as often as needed.
 */
final readonly class CreateCourseInstallmentCharges
{
    public function __construct(
        private CoursePaymentGateway $gateway,
        private UpdateCourseInstallmentPaid $markPaid,
        private CreateTrialPaymentAlert $alert,
        private TrialReservationLock $lock,
    ) {}

    public function handle(): int
    {
        if (! $this->gateway->ready()) {
            return 0;
        }
        $charged = 0;
        CourseInstallment::query()
            ->whereIn('status', [CourseInstallmentStatus::Scheduled, CourseInstallmentStatus::Failed])
            ->where('due_at', '<=', now())
            ->where(fn ($query) => $query->whereNull('next_attempt_at')->orWhere('next_attempt_at', '<=', now()))
            ->where(fn ($query) => $query->where('status', CourseInstallmentStatus::Scheduled)->orWhereNotNull('next_attempt_at'))
            ->whereHas('enrollment', fn ($query) => $query->where('status', CourseEnrollmentStatus::Confirmed))
            ->lazyById()
            ->each(function (CourseInstallment $installment) use (&$charged): void {
                $this->lock->run($installment->course_enrollment_id, function () use ($installment, &$charged): void {
                    $installment->refresh()->load('enrollment.user', 'enrollment.cohort');
                    if ($installment->isPayable() && $this->charge($installment)) {
                        $charged++;
                    }
                });
            });

        return $charged;
    }

    private function charge(CourseInstallment $installment): bool
    {
        $enrollment = $installment->enrollment;
        [$customerId, $paymentMethodId] = $this->savedCard($enrollment);
        if ($customerId === null || $paymentMethodId === null) {
            $this->fail($installment, 'Aucune carte enregistrée pour le prélèvement automatique.');

            return false;
        }
        $installment->update(['attempts' => $installment->attempts + 1]);
        try {
            $paymentIntent = $this->gateway->chargeInstallment($installment, $customerId, $paymentMethodId);
        } catch (CardException $exception) {
            $this->fail($installment, $this->reason($exception->getDeclineCode() ?? $exception->getStripeCode()));

            return false;
        } catch (Throwable $exception) {
            // Stripe unreachable: not the student's fault, try again in an hour without telling them.
            report($exception);
            $installment->update(['next_attempt_at' => now()->addHour()]);

            return false;
        }
        if (($paymentIntent['status'] ?? '') !== 'succeeded') {
            $this->fail($installment, $this->reason('authentication_required'));

            return false;
        }

        return $this->markPaid->handle($installment, (string) $paymentIntent['id']);
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

    private function fail(CourseInstallment $installment, string $reason): void
    {
        $retryDays = config('courses.installments.retry_days');
        $nextRetryInDays = $retryDays[max(0, $installment->attempts - 1)] ?? null;
        $installment->update([
            'status' => CourseInstallmentStatus::Failed,
            'failure_message' => mb_substr($reason, 0, 255),
            'next_attempt_at' => $nextRetryInDays !== null ? now()->addDays((int) $nextRetryInDays) : null,
        ]);
        $installment->enrollment->user->notify(new CourseInstallmentFailed($installment));
        if ($nextRetryInDays === null) {
            $this->alert->handle(null, 'l’échéance '.$installment->position.' du parcours de '.$installment->enrollment->user->name
                .' reste impayée après plusieurs tentatives (inscription '.$installment->course_enrollment_id.'). Contacte l’élève.');
        }
    }
}
