<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\UpdateCourseEnrollment;
use App\Http\Requests\UpdateCourseEnrollmentRequest;
use App\Models\CourseEnrollment;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

final readonly class CourseEnrollmentManagementController
{
    public function update(UpdateCourseEnrollmentRequest $request, CourseEnrollment $enrollment, UpdateCourseEnrollment $updateEnrollment): RedirectResponse
    {
        $updateEnrollment->handle($enrollment, ['notes' => $request->input('notes')]);
        Inertia::flash('toast', ['type' => 'success', 'message' => __('courses.enrollment_saved', [], 'fr')]);

        return back();
    }
}
