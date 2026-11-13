<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\UpdateCourseEnrollment;
use App\Enums\CourseEnrollmentStatus;
use App\Http\Requests\UpdateCourseEnrollmentRequest;
use App\Http\Resources\CourseEnrollmentResource;
use App\Models\CourseCohort;
use App\Models\CourseEnrollment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final readonly class CourseEnrollmentManagementController
{
    public function index(Request $request): Response
    {
        $enrollments = CourseEnrollment::query()
            ->with(['user', 'cohort.sessions', 'installments', 'attendances.session'])
            ->latest()
            ->get();

        $cohorts = CourseCohort::query()
            ->whereNull('cancelled_at')
            ->where('starts_at', '>', now())
            ->withCount(['enrollments as taken_seats' => fn ($query) => $query->holdingSeat()])
            ->orderBy('starts_at')
            ->get()
            ->filter(fn (CourseCohort $cohort): bool => $cohort->seatsLeft() > 0)
            ->map(fn (CourseCohort $cohort): array => [
                'id' => $cohort->id,
                'label' => $cohort->level->label(),
                'format_label' => $cohort->format->label(),
                'rhythm_label' => $cohort->rhythm->label(),
                'starts_at' => $cohort->starts_at->toIso8601String(),
                'price_cents' => $cohort->price_cents,
                'currency' => $cohort->currency,
                'seats_left' => $cohort->seatsLeft(),
            ])
            ->values();

        return Inertia::render('course-enrollments/manage', [
            'enrollments' => CourseEnrollmentResource::collection($enrollments)->resolve($request),
            'cohorts' => $cohorts,
            'timezone' => config('trials.timezone'),
            'statuses' => array_map(fn (CourseEnrollmentStatus $status): string => $status->value, CourseEnrollmentStatus::cases()),
        ]);
    }

    public function update(UpdateCourseEnrollmentRequest $request, CourseEnrollment $enrollment, UpdateCourseEnrollment $updateEnrollment): RedirectResponse
    {
        $updateEnrollment->handle($enrollment, ['notes' => $request->input('notes')]);
        Inertia::flash('toast', ['type' => 'success', 'message' => __('courses.enrollment_saved', [], 'fr')]);

        return back();
    }
}
