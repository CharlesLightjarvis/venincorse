<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateCourseCohort;
use App\Actions\DeleteCourseCohort;
use App\Actions\UpdateCourseCohort;
use App\Enums\CourseFormat;
use App\Enums\CourseLevel;
use App\Enums\CourseRhythm;
use App\Http\Requests\StoreCourseCohortRequest;
use App\Http\Requests\UpdateCourseCohortRequest;
use App\Http\Resources\CourseCohortResource;
use App\Models\CourseCohort;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final readonly class CourseCohortController
{
    public function index(Request $request): Response
    {
        $cohorts = CourseCohort::query()->withCount('sessions')
            ->orderByRaw('ends_at < ? asc', [now()])
            ->orderBy('starts_at')
            ->get();

        return Inertia::render('courses/cohorts/index', [
            'cohorts' => CourseCohortResource::collection($cohorts)->resolve($request),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('courses/cohorts/create', [
            'levels' => array_map(fn (CourseLevel $level): array => [
                'value' => $level->value,
                'label' => $level->label(),
                'prices' => [
                    CourseFormat::Group->value => $level->priceCents(CourseFormat::Group),
                    CourseFormat::Solo->value => $level->priceCents(CourseFormat::Solo),
                ],
            ], CourseLevel::cases()),
            'formats' => array_map(fn (CourseFormat $format): array => [
                'value' => $format->value, 'label' => $format->label(), 'max_capacity' => $format->maxCapacity(),
            ], CourseFormat::cases()),
            'rhythms' => array_map(fn (CourseRhythm $rhythm): array => [
                'value' => $rhythm->value, 'label' => $rhythm->label(),
                'weekdays' => $rhythm->weekdays(), 'session_hours' => $rhythm->sessionHours(),
            ], CourseRhythm::cases()),
            'startHours' => config('courses.session_start_hours'),
            'totalHours' => config('courses.total_hours'),
            'currency' => config('courses.currency'),
            'timezone' => config('trials.timezone'),
        ]);
    }

    public function store(StoreCourseCohortRequest $request, CreateCourseCohort $createCohort): RedirectResponse
    {
        $cohort = $createCohort->handle($request->cohort());
        Inertia::flash('toast', ['type' => 'success', 'message' => __('courses.cohort_created', [], 'fr')]);

        return to_route('course-cohorts.show', $cohort);
    }

    public function show(Request $request, CourseCohort $cohort): Response
    {
        return Inertia::render('courses/cohorts/show', [
            'cohort' => CourseCohortResource::make($cohort->load('sessions')->loadCount('sessions'))->resolve($request),
            'timezone' => config('trials.timezone'),
        ]);
    }

    public function update(UpdateCourseCohortRequest $request, CourseCohort $cohort, UpdateCourseCohort $updateCohort): RedirectResponse
    {
        $updateCohort->handle($cohort, $request->changes());
        Inertia::flash('toast', ['type' => 'success', 'message' => __('courses.cohort_saved', [], 'fr')]);

        return back();
    }

    public function destroy(CourseCohort $cohort, DeleteCourseCohort $deleteCohort): RedirectResponse
    {
        $deleteCohort->handle($cohort);
        Inertia::flash('toast', ['type' => 'success', 'message' => __('courses.cohort_deleted', [], 'fr')]);

        return to_route('course-cohorts.index');
    }
}
