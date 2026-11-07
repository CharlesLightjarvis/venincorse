<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateCourseEnrollmentCancellation;
use App\Http\Requests\CreateCourseEnrollmentCancellationRequest;
use App\Models\CourseEnrollment;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

final readonly class CourseEnrollmentCancellationController
{
    public function store(CreateCourseEnrollmentCancellationRequest $request, CourseEnrollment $enrollment, CreateCourseEnrollmentCancellation $cancel): RedirectResponse
    {
        $cancel->handle($enrollment, $request->integer('refund_cents'), $request->string('reason')->trim()->toString());
        Inertia::flash('toast', ['type' => 'success', 'message' => __('courses.enrollment_cancelled', [], 'fr')]);

        return back();
    }
}
