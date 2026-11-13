<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\CourseEnrollmentStatus;
use App\Enums\CourseInstallmentStatus;
use App\Enums\CoursePaymentMethod;
use App\Enums\CoursePaymentPlan;
use App\Models\CourseEnrollment;
use App\Notifications\CourseEnrollmentCancelled;
use App\Services\CoursePaymentGateway;
use App\Services\TrialReservationLock;
use Illuminate\Validation\ValidationException;
use Throwable;

/**
 * The teacher ends an enrollment: a withdrawal within 14 days (refund of the part not followed), a group the
 * school cancels (full refund), or a student who leaves (no refund). The refund is taken from the payments
 * actually made, latest first; the remaining instalments are cancelled, the seat freed and the student emailed.
 * Each refund is recorded as soon as Stripe accepts it, so a failure halfway never loses track of the money.
 */
final readonly class CreateCourseEnrollmentCancellation
{
    public function __construct(
        private CoursePaymentGateway $gateway,
        private CreateTrialPaymentAlert $alert,
        private TrialReservationLock $lock,
    ) {}

    public function handle(CourseEnrollment $enrollment, int $refundCents, string $reason): CourseEnrollment
    {
        return $this->lock->run($enrollment->id, function () use ($enrollment, $refundCents, $reason): CourseEnrollment {
            $enrollment->refresh()->load(['installments', 'cohort', 'user']);
            if (! $enrollment->isCancellable()) {
                throw ValidationException::withMessages(['refund_cents' => __('courses.cancellation_unavailable', [], 'fr')]);
            }
            if ($refundCents > $enrollment->paidCents() - $enrollment->refunded_cents) {
                throw ValidationException::withMessages(['refund_cents' => __('courses.refund_too_high', [], 'fr')]);
            }

            if ($refundCents > 0 && ($enrollment->payment_method ?? CoursePaymentMethod::Stripe)->isManual()) {
                // The money never went through Stripe: the school refunds it itself and we only record the amount.
                $enrollment->increment('refunded_cents', $refundCents);
            } elseif ($refundCents > 0) {
                try {
                    $payments = $this->payments($enrollment);
                } catch (Throwable $exception) {
                    report($exception);
                    $payments = [];
                }
                if ($refundCents > array_sum(array_column($payments, 1))) {
                    throw ValidationException::withMessages(['refund_cents' => __('courses.refund_failed', [], 'fr')]);
                }

                $remaining = $refundCents;
                foreach ($payments as [$paymentIntentId, $paidCents]) {
                    if ($remaining === 0) {
                        break;
                    }
                    $amount = min($remaining, $paidCents);
                    try {
                        $this->gateway->refund($enrollment, $paymentIntentId, $amount);
                    } catch (Throwable $exception) {
                        report($exception);
                        if ($remaining !== $refundCents) {
                            $this->alert->handle(null, 'le remboursement d’un parcours s’est arrêté en cours de route (inscription '.$enrollment->id.') : '
                                .number_format(($refundCents - $remaining) / 100, 2, ',', ' ').' € remboursés sur '
                                .number_format($refundCents / 100, 2, ',', ' ').' €. Termine-le depuis Stripe.');
                        }

                        throw ValidationException::withMessages(['refund_cents' => __('courses.refund_failed', [], 'fr')]);
                    }
                    $enrollment->increment('refunded_cents', $amount);
                    $remaining -= $amount;
                }
            }

            $enrollment->update([
                'status' => CourseEnrollmentStatus::Cancelled,
                'cancelled_at' => now(),
                'cancellation_reason' => $reason,
            ]);
            $enrollment->installments()
                ->whereIn('status', [CourseInstallmentStatus::Scheduled, CourseInstallmentStatus::Failed])
                ->update(['status' => CourseInstallmentStatus::Cancelled, 'next_attempt_at' => null]);
            $enrollment->user->notify(new CourseEnrollmentCancelled($enrollment->refresh(), $refundCents));

            return $enrollment;
        });
    }

    /**
     * The settled payments as [payment intent, amount], latest first.
     *
     * @return list<array{0: string, 1: int}>
     */
    private function payments(CourseEnrollment $enrollment): array
    {
        if ($enrollment->payment_plan === CoursePaymentPlan::Installments) {
            return $enrollment->installments
                ->where('status', CourseInstallmentStatus::Paid)
                ->filter(fn ($installment): bool => $installment->stripe_payment_intent_id !== null)
                ->sortByDesc('position')
                ->map(fn ($installment): array => [$installment->stripe_payment_intent_id, $installment->amount_cents])
                ->values()->all();
        }
        $paymentIntent = $enrollment->stripe_session_id
            ? ($this->gateway->session($enrollment->stripe_session_id)['payment_intent'] ?? null)
            : null;

        return is_string($paymentIntent) ? [[$paymentIntent, $enrollment->amount_cents]] : [];
    }
}
