<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\CourseEnrollmentStatus;
use App\Enums\CourseInstallmentStatus;
use App\Enums\CoursePaymentPlan;
use App\Models\CourseCohort;
use App\Models\CourseEnrollment;
use App\Models\CourseInstallment;
use App\Models\CourseSessionAttendance;

/** The numbers the team reads on its dashboard: money, enrollments, seats and attendance. */
final readonly class BuildCourseDashboard
{
    /** @return array{monthRevenueCents: int, activeEnrollments: int, fillRate: int, attendanceRate: int|null, paymentReview: int, failedInstallments: int} */
    public function handle(): array
    {
        $monthStart = now()->startOfMonth();

        $fullRevenue = (int) CourseEnrollment::query()
            ->where('payment_plan', CoursePaymentPlan::Full)
            ->where('paid_at', '>=', $monthStart)
            ->whereIn('status', [CourseEnrollmentStatus::Confirmed, CourseEnrollmentStatus::PaymentReview])
            ->sum('amount_cents');

        $installmentRevenue = (int) CourseInstallment::query()
            ->where('status', CourseInstallmentStatus::Paid)
            ->where('paid_at', '>=', $monthStart)
            ->sum('amount_cents');

        $cohorts = CourseCohort::query()
            ->whereNull('cancelled_at')
            ->where('ends_at', '>', now())
            ->withCount(['enrollments as taken_seats' => fn ($query) => $query->holdingSeat()])
            ->get();

        $capacity = (int) $cohorts->sum('capacity');
        $taken = (int) $cohorts->sum('taken_seats');

        $attendanceTotal = CourseSessionAttendance::query()->count();
        $present = CourseSessionAttendance::query()->where('status', 'present')->count();

        return [
            'monthRevenueCents' => $fullRevenue + $installmentRevenue,
            'activeEnrollments' => CourseEnrollment::query()
                ->where('status', CourseEnrollmentStatus::Confirmed)
                ->whereHas('cohort', fn ($query) => $query->where('ends_at', '>', now()))
                ->count(),
            'fillRate' => $capacity > 0 ? (int) round($taken / $capacity * 100) : 0,
            'attendanceRate' => $attendanceTotal > 0 ? (int) round($present / $attendanceTotal * 100) : null,
            'paymentReview' => CourseEnrollment::query()->where('status', CourseEnrollmentStatus::PaymentReview)->count(),
            'failedInstallments' => CourseInstallment::query()->where('status', CourseInstallmentStatus::Failed)->count(),
        ];
    }
}
