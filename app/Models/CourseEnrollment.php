<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\CourseEnrollmentStatus;
use App\Enums\CoursePaymentPlan;
use Carbon\CarbonImmutable;
use Database\Factories\CourseEnrollmentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'course_cohort_id', 'status', 'payment_plan', 'goal', 'timezone', 'amount_cents', 'currency', 'expires_at', 'checkout_started_at', 'stripe_session_id', 'checkout_url', 'paid_at', 'terms_accepted_at', 'terms_version', 'early_start_requested_at', 'notes'])]
final class CourseEnrollment extends Model
{
    /** @use HasFactory<CourseEnrollmentFactory> */
    use HasFactory, HasUuids;

    protected function casts(): array
    {
        return [
            'status' => CourseEnrollmentStatus::class,
            'payment_plan' => CoursePaymentPlan::class,
            'amount_cents' => 'integer',
            'expires_at' => 'immutable_datetime',
            'checkout_started_at' => 'immutable_datetime',
            'paid_at' => 'immutable_datetime',
            'terms_accepted_at' => 'immutable_datetime',
            'early_start_requested_at' => 'immutable_datetime',
        ];
    }

    /** Enrollments that keep a seat: paid or being paid, and unpaid ones still within their payment window. */
    #[Scope]
    protected function holdingSeat(Builder $query): void
    {
        $query->where(fn (Builder $query) => $query
            ->whereIn('status', CourseEnrollmentStatus::seatHoldingCases())
            ->orWhere(fn (Builder $query) => $query
                ->where('status', CourseEnrollmentStatus::Pending)
                ->where('expires_at', '>', now())));
    }

    public function isAwaitingPayment(): bool
    {
        return $this->status === CourseEnrollmentStatus::Pending && $this->expires_at->isFuture();
    }

    /** The legal withdrawal period: 14 days from the enrollment (Code de la consommation, art. L221-18). */
    public function withdrawalEndsAt(): CarbonImmutable
    {
        return ($this->paid_at ?? $this->created_at)->addDays((int) config('courses.withdrawal_days'));
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function cohort(): BelongsTo
    {
        return $this->belongsTo(CourseCohort::class, 'course_cohort_id');
    }
}
