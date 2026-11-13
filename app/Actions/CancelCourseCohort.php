<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\CourseEnrollmentStatus;
use App\Enums\CourseInstallmentStatus;
use App\Models\CourseCohort;
use App\Models\CourseEnrollment;
use App\Notifications\CourseEnrollmentCancelled;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Throwable;

/**
 * The school closes a group for good: future sessions are cancelled, confirmed students are fully refunded and
 * emailed one by one, unpaid holds are released. A refund that Stripe refuses leaves that student enrolled so the
 * teacher can retry from their file; the group itself is already cancelled.
 */
final readonly class CancelCourseCohort
{
    public function __construct(
        private CreateCourseEnrollmentCancellation $cancelEnrollment,
        private CreateTrialPaymentAlert $alert,
    ) {}

    /** @return array{cancelled: int, released: int, failed: list<string>} */
    public function handle(CourseCohort $cohort, string $reason): array
    {
        $cohort = DB::transaction(function () use ($cohort, $reason): CourseCohort {
            $cohort = CourseCohort::query()->lockForUpdate()->findOrFail($cohort->id);
            if ($cohort->isCancelled()) {
                throw ValidationException::withMessages(['cohort' => __('courses.cohort_already_cancelled', [], 'fr')]);
            }

            $cohort->update([
                'cancelled_at' => now(),
                'cancellation_reason' => $reason,
                'is_published' => false,
            ]);
            $cohort->sessions()
                ->where('starts_at', '>', now())
                ->whereNull('cancelled_at')
                ->update([
                    'cancelled_at' => now(),
                    'cancellation_reason' => $reason,
                ]);

            return $cohort;
        });

        $cancelled = 0;
        $released = 0;
        $failed = [];
        $enrollments = $cohort->enrollments()->with(['user', 'installments', 'cohort'])
            ->whereIn('status', [
                CourseEnrollmentStatus::Pending,
                CourseEnrollmentStatus::Processing,
                CourseEnrollmentStatus::Confirmed,
                CourseEnrollmentStatus::PaymentReview,
            ])
            ->get();

        foreach ($enrollments as $enrollment) {
            if ($enrollment->status === CourseEnrollmentStatus::Processing) {
                $failed[] = $enrollment->user->name.' (paiement en cours)';

                continue;
            }

            if ($enrollment->status === CourseEnrollmentStatus::Pending) {
                $this->release($enrollment, $reason);
                $released++;

                continue;
            }

            try {
                $this->cancelEnrollment->handle(
                    $enrollment,
                    max(0, $enrollment->paidCents() - $enrollment->refunded_cents),
                    $reason,
                );
                $cancelled++;
            } catch (Throwable $exception) {
                report($exception);
                $failed[] = $enrollment->user->name;
            }
        }

        if ($failed !== []) {
            $this->alert->handle(null, 'l’annulation du groupe '.$cohort->level->label().' (groupe '.$cohort->id.') n’a pas pu aboutir pour : '
                .implode(', ', $failed).'. Vérifie leurs remboursements depuis Stripe.');
        }

        return ['cancelled' => $cancelled, 'released' => $released, 'failed' => $failed];
    }

    /** A seat that was never paid is simply freed; the student is told their hold ended. */
    private function release(CourseEnrollment $enrollment, string $reason): void
    {
        $enrollment->update([
            'status' => CourseEnrollmentStatus::Expired,
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
        ]);
        $enrollment->installments()
            ->whereIn('status', [CourseInstallmentStatus::Scheduled, CourseInstallmentStatus::Failed])
            ->update(['status' => CourseInstallmentStatus::Cancelled, 'next_attempt_at' => null]);
        $enrollment->user->notify(new CourseEnrollmentCancelled($enrollment->refresh(), 0));
    }
}
