<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateCourseEnrolledNotifications;
use App\Actions\CreateManualCourseEnrollment;
use App\Enums\CoursePaymentMethod;
use App\Http\Requests\StoreManualCourseEnrollmentRequest;
use App\Models\CourseCohort;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

final readonly class ManualCourseEnrollmentController
{
    public function store(
        StoreManualCourseEnrollmentRequest $request,
        CreateManualCourseEnrollment $createEnrollment,
        CreateCourseEnrolledNotifications $notify,
    ): RedirectResponse {
        $student = User::query()
            ->where('email', $request->string('email')->trim()->lower()->toString())
            ->firstOrFail();
        $cohort = CourseCohort::query()->findOrFail($request->integer('cohort_id'));
        $reference = trim((string) $request->input('payment_reference'));

        $enrollment = $createEnrollment->handle(
            $student,
            $cohort,
            CoursePaymentMethod::from($request->string('payment_method')->toString()),
            $reference !== '' ? $reference : null,
            (string) $request->input('goal', ''),
        );
        $notify->handle($enrollment);
        Inertia::flash('toast', ['type' => 'success', 'message' => __('courses.manual_enrollment_created', [], 'fr')]);

        return back();
    }
}
