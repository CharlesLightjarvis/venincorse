<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\CourseInstallmentStatus;
use App\Models\CourseInstallment;
use App\Notifications\CourseInstallmentPaid;

/** Records an instalment as paid (automatic charge, payment page or webhook) and sends the receipt once. */
final readonly class UpdateCourseInstallmentPaid
{
    public function handle(CourseInstallment $installment, string $paymentIntentId, ?string $paymentMethodId = null): bool
    {
        $updated = CourseInstallment::query()->whereKey($installment->id)
            ->whereIn('status', [CourseInstallmentStatus::Scheduled, CourseInstallmentStatus::Failed])
            ->update([
                'status' => CourseInstallmentStatus::Paid,
                'paid_at' => now(),
                'stripe_payment_intent_id' => $paymentIntentId,
                'next_attempt_at' => null,
                'failure_message' => null,
            ]);
        if ($updated === 0) {
            return false;
        }
        $installment->refresh()->load('enrollment.user', 'enrollment.cohort');
        if ($paymentMethodId !== null) {
            $installment->enrollment->update(['stripe_payment_method_id' => $paymentMethodId]);
        }
        $installment->enrollment->user->notify(new CourseInstallmentPaid($installment));

        return true;
    }
}
