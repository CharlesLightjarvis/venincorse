<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\CourseEnrollmentStatus;
use App\Enums\CourseInstallmentStatus;
use App\Enums\CoursePaymentMethod;
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
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['user_id', 'course_cohort_id', 'status', 'payment_plan', 'payment_method', 'payment_reference', 'goal', 'timezone', 'amount_cents', 'currency', 'expires_at', 'checkout_started_at', 'stripe_session_id', 'checkout_url', 'stripe_customer_id', 'stripe_payment_method_id', 'paid_at', 'refunded_cents', 'cancelled_at', 'cancellation_reason', 'terms_accepted_at', 'terms_version', 'early_start_requested_at', 'notes'])]
final class CourseEnrollment extends Model
{
    /** @use HasFactory<CourseEnrollmentFactory> */
    use HasFactory, HasUuids;

    protected function casts(): array
    {
        return [
            'status' => CourseEnrollmentStatus::class,
            'payment_plan' => CoursePaymentPlan::class,
            'payment_method' => CoursePaymentMethod::class,
            'amount_cents' => 'integer',
            'expires_at' => 'immutable_datetime',
            'checkout_started_at' => 'immutable_datetime',
            'paid_at' => 'immutable_datetime',
            'refunded_cents' => 'integer',
            'cancelled_at' => 'immutable_datetime',
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

    /** What the Stripe payment page charges at enrollment: everything, or the first instalment. */
    public function checkoutAmountCents(): int
    {
        return $this->payment_plan->amountsCents($this->amount_cents)[0];
    }

    /** What the student actually paid so far: the full price, or the instalments settled. */
    public function paidCents(): int
    {
        if ($this->paid_at === null) {
            return 0;
        }

        if ($this->payment_plan === CoursePaymentPlan::Full) {
            return $this->amount_cents;
        }

        return (int) ($this->relationLoaded('installments')
            ? $this->installments->where('status', CourseInstallmentStatus::Paid)->sum('amount_cents')
            : $this->installments()->where('status', CourseInstallmentStatus::Paid)->sum('amount_cents'));
    }

    /** Only a paid enrollment of a group still running (or about to) is cancelled by the teacher. */
    public function isCancellable(): bool
    {
        return in_array($this->status, [CourseEnrollmentStatus::Confirmed, CourseEnrollmentStatus::PaymentReview], true);
    }

    public function installments(): HasMany
    {
        return $this->hasMany(CourseInstallment::class)->orderBy('position');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(CourseSessionAttendance::class);
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
