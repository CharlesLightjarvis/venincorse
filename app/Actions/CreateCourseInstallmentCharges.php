<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\CourseEnrollmentStatus;
use App\Enums\CourseInstallmentStatus;
use App\Models\CourseInstallment;
use App\Services\CoursePaymentGateway;
use App\Services\TrialReservationLock;

/**
 * Charges the due instalments of confirmed enrollments on the card saved at enrollment. A declined charge emails
 * the student a link to pay it themselves, and is retried automatically a few days later; after the last retry the
 * teaching team is alerted. Safe to run as often as needed.
 */
final readonly class CreateCourseInstallmentCharges
{
    public function __construct(
        private CoursePaymentGateway $gateway,
        private ChargeCourseInstallment $charge,
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
                    if ($installment->isPayable() && $this->charge->handle($installment)) {
                        $charged++;
                    }
                });
            });

        return $charged;
    }
}
