<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\CourseInstallmentStatus;
use Database\Factories\CourseInstallmentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['course_enrollment_id', 'position', 'amount_cents', 'status', 'due_at', 'paid_at', 'stripe_payment_intent_id', 'stripe_session_id', 'checkout_url', 'attempts', 'next_attempt_at', 'failure_message'])]
final class CourseInstallment extends Model
{
    /** @use HasFactory<CourseInstallmentFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'status' => CourseInstallmentStatus::class,
            'position' => 'integer',
            'amount_cents' => 'integer',
            'attempts' => 'integer',
            'due_at' => 'immutable_datetime',
            'paid_at' => 'immutable_datetime',
            'next_attempt_at' => 'immutable_datetime',
        ];
    }

    /** Due and unpaid: the student may settle it themselves at any time. */
    public function isPayable(): bool
    {
        return in_array($this->status, [CourseInstallmentStatus::Scheduled, CourseInstallmentStatus::Failed], true)
            && $this->due_at->isPast();
    }

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(CourseEnrollment::class, 'course_enrollment_id');
    }
}
