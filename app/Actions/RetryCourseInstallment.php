<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\CourseEnrollmentStatus;
use App\Enums\CourseInstallmentStatus;
use App\Models\CourseInstallment;
use App\Services\CoursePaymentGateway;
use App\Services\TrialReservationLock;
use Illuminate\Validation\ValidationException;

/**
 * The teacher retries a failed (or due) instalment right now instead of waiting for the next automatic attempt.
 * The student is not emailed again if the card still declines: the teacher sees the reason and can call them.
 */
final readonly class RetryCourseInstallment
{
    public function __construct(
        private CoursePaymentGateway $gateway,
        private ChargeCourseInstallment $charge,
        private TrialReservationLock $lock,
    ) {}

    public function handle(CourseInstallment $installment): void
    {
        if (! $this->gateway->ready()) {
            throw ValidationException::withMessages(['installment' => __('courses.payment_unavailable', [], 'fr')]);
        }

        $this->lock->run($installment->course_enrollment_id, function () use ($installment): void {
            $installment->refresh()->load('enrollment.cohort');
            $enrollment = $installment->enrollment;

            if (! $installment->isPayable()
                || $enrollment->status !== CourseEnrollmentStatus::Confirmed
                || $enrollment->cohort->isCancelled()) {
                throw ValidationException::withMessages(['installment' => __('courses.installment_not_payable', [], 'fr')]);
            }

            if (! $this->charge->handle($installment, notifyStudent: false)) {
                $installment->refresh();
                throw ValidationException::withMessages([
                    'installment' => $installment->status === CourseInstallmentStatus::Paid
                        ? __('courses.installment_paid', [], 'fr')
                        : ($installment->failure_message ?: __('courses.installment_retry_failed', [], 'fr')),
                ]);
            }
        });
    }
}
