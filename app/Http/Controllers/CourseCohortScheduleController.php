<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\UpdateCourseCohortSchedule;
use App\Http\Requests\UpdateCourseCohortScheduleRequest;
use App\Models\CourseCohort;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

final readonly class CourseCohortScheduleController
{
    public function update(UpdateCourseCohortScheduleRequest $request, CourseCohort $cohort, UpdateCourseCohortSchedule $updateSchedule): RedirectResponse
    {
        $updateSchedule->handle($cohort, $request->schedule());
        Inertia::flash('toast', ['type' => 'success', 'message' => __('courses.schedule_saved', [], 'fr')]);

        return back();
    }
}
