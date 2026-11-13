<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\RecordCourseSessionAttendance;
use App\Http\Requests\UpdateCourseSessionAttendanceRequest;
use App\Models\CourseSession;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

final readonly class CourseSessionAttendanceController
{
    public function update(UpdateCourseSessionAttendanceRequest $request, CourseSession $session, RecordCourseSessionAttendance $record): RedirectResponse
    {
        $record->handle($session, $request->attendances());
        Inertia::flash('toast', ['type' => 'success', 'message' => __('courses.attendance_saved', [], 'fr')]);

        return back();
    }
}
