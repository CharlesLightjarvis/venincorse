<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\ApplyCourseInstallmentPayment;
use App\Actions\CreateCourseCheckout;
use App\Actions\CreateCourseEnrollment;
use App\Actions\ReconcileCourseEnrollmentPayment;
use App\Enums\CourseEnrollmentStatus;
use App\Enums\CourseFormat;
use App\Enums\CourseInstallmentStatus;
use App\Enums\CourseLevel;
use App\Http\Requests\StoreCourseEnrollmentRequest;
use App\Http\Resources\CourseCohortResource;
use App\Http\Resources\CourseEnrollmentResource;
use App\Models\CourseCohort;
use App\Models\CourseEnrollment;
use App\Models\CourseInstallment;
use App\Services\CoursePaymentGateway;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;
use Throwable;

final readonly class CourseEnrollmentController
{
    /** The public enrollment page: the open groups of every level, the student picks one and pays. */
    public function create(Request $request, CoursePaymentGateway $gateway): Response
    {
        $cohorts = CourseCohort::query()
            ->withCount(['enrollments as taken_seats' => fn ($query) => $query->holdingSeat()])
            ->where('is_published', true)
            ->where('starts_at', '>', now())
            ->orderBy('starts_at')
            ->get();
        $enrolledCohortIds = $request->user()
            ? CourseEnrollment::query()->where('user_id', $request->user()->id)
                ->whereIn('status', CourseEnrollmentStatus::seatHoldingCases())
                ->pluck('course_cohort_id')
            : collect();

        return Inertia::render('course-enrollments/create', [
            'cohorts' => CourseCohortResource::collection($cohorts)->resolve($request),
            'levels' => array_map(fn (CourseLevel $level): array => [
                'value' => $level->value,
                'label' => $level->label(),
                'prices' => [
                    CourseFormat::Group->value => $level->priceCents(CourseFormat::Group),
                    CourseFormat::Solo->value => $level->priceCents(CourseFormat::Solo),
                ],
            ], CourseLevel::cases()),
            'selected' => [
                'level' => CourseLevel::tryFrom((string) $request->query('level'))?->value ?? CourseLevel::A1->value,
                'format' => CourseFormat::tryFrom((string) $request->query('format'))?->value ?? CourseFormat::Group->value,
                'cohort' => $request->integer('cohort') ?: null,
            ],
            // Arriving from a course page: the level and format are already chosen, so the funnel does not ask again.
            'choiceLocked' => CourseLevel::tryFrom((string) $request->query('level')) !== null
                && CourseFormat::tryFrom((string) $request->query('format')) !== null,
            'enrolledCohortIds' => $enrolledCohortIds->values(),
            'paymentReady' => $gateway->ready(),
            'withdrawalDays' => config('courses.withdrawal_days'),
            'holdMinutes' => config('courses.hold_minutes'),
            'totalHours' => config('courses.total_hours'),
            'installments' => [
                'count' => config('courses.installments.count'),
                'surcharge_percent' => (float) config('courses.installments.surcharge_percent'),
                'interval_days' => config('courses.installments.interval_days'),
            ],
        ]);
    }

    public function store(StoreCourseEnrollmentRequest $request, CreateCourseEnrollment $createEnrollment, CreateCourseCheckout $createCheckout): HttpResponse
    {
        $enrollment = $createEnrollment->handle($request->user(), $request->cohort(), $request->enrollment());

        return Inertia::location($createCheckout->handle($enrollment));
    }

    /** Reopens the Stripe page of the student's own unpaid enrollment. */
    public function checkout(Request $request, CourseEnrollment $enrollment, CreateCourseCheckout $createCheckout): HttpResponse
    {
        abort_unless($enrollment->user_id === $request->user()->id, 404);

        return Inertia::location($createCheckout->handle($enrollment));
    }

    /** The student's courses; payments left unfinished at Stripe are checked first (`?refresh=1` on return). */
    public function index(Request $request, ReconcileCourseEnrollmentPayment $reconcile, CoursePaymentGateway $gateway, ApplyCourseInstallmentPayment $applyInstallment): Response
    {
        if ($request->boolean('refresh') && $gateway->ready()) {
            CourseInstallment::query()->whereNotNull('stripe_session_id')
                ->whereIn('status', [CourseInstallmentStatus::Scheduled, CourseInstallmentStatus::Failed])
                ->whereHas('enrollment', fn ($query) => $query->where('user_id', $request->user()->id))
                ->limit(3)->get()
                ->each(function (CourseInstallment $installment) use ($gateway, $applyInstallment): void {
                    try {
                        $applyInstallment->handle($gateway->session($installment->stripe_session_id));
                    } catch (Throwable $exception) {
                        report($exception);
                    }
                });
        }
        CourseEnrollment::query()->where('user_id', $request->user()->id)
            ->whereIn('status', [CourseEnrollmentStatus::Pending, CourseEnrollmentStatus::Processing])
            ->whereNotNull('stripe_session_id')
            ->latest()->limit(3)->get()
            ->each(fn (CourseEnrollment $enrollment) => $reconcile->handle($enrollment, force: $request->boolean('refresh')));

        $enrollments = CourseEnrollment::query()->with(['cohort.sessions', 'user', 'installments'])
            ->where('user_id', $request->user()->id)
            ->whereNot(fn ($query) => $query->where('status', CourseEnrollmentStatus::Expired)->whereNull('paid_at'))
            ->orderByDesc('created_at')->orderByDesc('id')
            ->get();

        return Inertia::render('course-enrollments/index', [
            'enrollments' => CourseEnrollmentResource::collection($enrollments)->resolve($request),
        ]);
    }
}
