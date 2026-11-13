<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\CourseEnrollmentStatus;
use App\Enums\CourseInstallmentStatus;
use App\Enums\CoursePaymentPlan;
use App\Models\CourseCohort;
use App\Models\CourseEnrollment;
use App\Notifications\CourseEnrollmentRefunded;
use App\Services\CoursePaymentGateway;
use App\Services\TrialPaymentGateway;
use App\Services\TrialReservationLock;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Throwable;

/**
 * Applies a Stripe Checkout outcome to a course enrollment (webhook, return from Stripe or scheduled catch-up).
 * A payment confirms the seat it held; a payment arriving after the hold expired only gets a seat if the group
 * still has one and has not started, otherwise it is refunded automatically.
 */
final readonly class ApplyCourseEnrollmentPayment
{
    public function __construct(
        private CoursePaymentGateway $gateway,
        private CreateCourseEnrolledNotifications $notifyEnrolled,
        private CreateTrialPaymentAlert $alert,
        private TrialReservationLock $lock,
    ) {}

    /** @param array<string, mixed> $session */
    public function handle(array $session, string $eventType): void
    {
        $reference = data_get($session, 'metadata.course_enrollment_id');
        if (! is_string($reference) || ($session['livemode'] ?? null) !== TrialPaymentGateway::liveMode()) {
            return;
        }

        $this->lock->run($reference, function () use ($session, $reference, $eventType): void {
            /** @var array{confirmed: ?CourseEnrollment, refundable: ?CourseEnrollment, alert: ?string} $outcome */
            $outcome = DB::transaction(fn (): array => $this->apply($session, $reference, $eventType), 5);

            if ($outcome['confirmed']) {
                $this->notifyEnrolled->handle($outcome['confirmed']);
            }
            if ($outcome['refundable']) {
                $this->refundLatePayment($outcome['refundable'], $session['payment_intent'] ?? null);
            } elseif ($outcome['alert'] !== null) {
                $this->alert->handle(null, $outcome['alert'].' (inscription '.$reference.')');
            }
        });
    }

    /**
     * @param  array<string, mixed>  $session
     * @return array{confirmed: ?CourseEnrollment, refundable: ?CourseEnrollment, alert: ?string}
     */
    private function apply(array $session, string $reference, string $eventType): array
    {
        $none = ['confirmed' => null, 'refundable' => null, 'alert' => null];
        $enrollment = CourseEnrollment::query()->lockForUpdate()->find($reference);
        if (! $enrollment || in_array($enrollment->status, CourseEnrollmentStatus::finalCases(), true)) {
            return $none;
        }
        if (($session['client_reference_id'] ?? null) !== $enrollment->id
            || ! is_string($session['id'] ?? null)
            || ($enrollment->stripe_session_id && $enrollment->stripe_session_id !== $session['id'])) {
            return $none;
        }
        $enrollment->stripe_session_id = $session['id'];
        $isPaid = ($session['payment_status'] ?? '') === 'paid';

        if (($session['amount_total'] ?? null) !== $enrollment->checkoutAmountCents()
            || strtoupper($session['currency'] ?? '') !== $enrollment->currency) {
            $wasUnderReview = $enrollment->status === CourseEnrollmentStatus::PaymentReview;
            $enrollment->status = CourseEnrollmentStatus::PaymentReview;
            $enrollment->save();

            return $wasUnderReview ? $none : [...$none, 'alert' => 'le montant payé pour un parcours ne correspond pas au prix'];
        }
        if ($enrollment->status === CourseEnrollmentStatus::PaymentReview) {
            if ($isPaid && $enrollment->paid_at === null) {
                $enrollment->paid_at = now();
            }
            $enrollment->save();

            return $none;
        }

        if ($isPaid) {
            $enrollment->paid_at ??= now();
            $enrollment->status = $this->seatStillAvailable($enrollment)
                ? CourseEnrollmentStatus::Confirmed
                : CourseEnrollmentStatus::PaymentReview;
            if (is_string($session['customer'] ?? null)) {
                $enrollment->stripe_customer_id = $session['customer'];
            }
            $enrollment->save();
            if ($enrollment->status === CourseEnrollmentStatus::Confirmed) {
                $this->scheduleInstallments($enrollment, $session['payment_intent'] ?? null);

                return [...$none, 'confirmed' => $enrollment];
            }

            return [...$none, 'refundable' => $enrollment];
        }

        if (($eventType === 'checkout.session.expired' && ($session['status'] ?? '') === 'expired'
            && $enrollment->status === CourseEnrollmentStatus::Pending)
            || ($eventType === 'checkout.session.async_payment_failed'
                && in_array($enrollment->status, [CourseEnrollmentStatus::Pending, CourseEnrollmentStatus::Processing], true))) {
            $enrollment->status = CourseEnrollmentStatus::Expired;
        } elseif (($session['status'] ?? '') === 'complete' && $enrollment->status === CourseEnrollmentStatus::Pending) {
            $enrollment->status = CourseEnrollmentStatus::Processing;
        }
        $enrollment->save();

        return $none;
    }

    /** The first instalment was just paid; the next ones fall due every 30 days from that payment. */
    private function scheduleInstallments(CourseEnrollment $enrollment, mixed $paymentIntent): void
    {
        if ($enrollment->payment_plan !== CoursePaymentPlan::Installments || $enrollment->installments()->exists()) {
            return;
        }
        $interval = (int) config('courses.installments.interval_days');
        foreach ($enrollment->payment_plan->amountsCents($enrollment->amount_cents) as $index => $amount) {
            $enrollment->installments()->create([
                'position' => $index + 1,
                'amount_cents' => $amount,
                'status' => $index === 0 ? CourseInstallmentStatus::Paid : CourseInstallmentStatus::Scheduled,
                'due_at' => $enrollment->paid_at->addDays($interval * $index),
                'paid_at' => $index === 0 ? $enrollment->paid_at : null,
                'stripe_payment_intent_id' => $index === 0 && is_string($paymentIntent) ? $paymentIntent : null,
            ]);
        }
    }

    /** The seat held during the payment window, or a free one if the hold expired; never once the group has started. */
    private function seatStillAvailable(CourseEnrollment $enrollment): bool
    {
        $cohort = CourseCohort::query()->lockForUpdate()->findOrFail($enrollment->course_cohort_id);
        if ($cohort->isCancelled() || $cohort->hasStarted()) {
            return false;
        }
        if ($enrollment->status === CourseEnrollmentStatus::Processing
            || ($enrollment->status === CourseEnrollmentStatus::Pending && $enrollment->expires_at->isFuture())) {
            return true;
        }
        $taken = CourseEnrollment::query()->where('course_cohort_id', $cohort->id)
            ->whereKeyNot($enrollment->id)->holdingSeat()->count();

        return $taken < $cohort->capacity;
    }

    private function refundLatePayment(CourseEnrollment $enrollment, mixed $paymentIntent): void
    {
        try {
            if (! is_string($paymentIntent)) {
                throw new RuntimeException('No payment intent on the Checkout Session.');
            }
            $this->gateway->refund($enrollment, $paymentIntent);
        } catch (Throwable $exception) {
            report($exception);
            $this->alert->handle(null, 'un paiement de parcours est arrivé alors que le groupe était complet ou commencé, et son remboursement automatique a échoué. Rembourse l’élève (inscription '.$enrollment->id.').');

            return;
        }
        $refunded = CourseEnrollment::query()->whereKey($enrollment->id)
            ->where('status', CourseEnrollmentStatus::PaymentReview)
            ->update(['status' => CourseEnrollmentStatus::Refunded]);
        if ($refunded > 0) {
            $enrollment->refresh()->load(['cohort', 'user'])->user->notify(new CourseEnrollmentRefunded($enrollment));
        }
    }
}
