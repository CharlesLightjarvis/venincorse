<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\UpdateCourseSessionRequest;
use App\Models\CourseSession;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

final readonly class CourseSessionController
{
    /** The teacher gives one session its own visio link; without one, the group's link is used. */
    public function update(UpdateCourseSessionRequest $request, CourseSession $session): RedirectResponse
    {
        $session->update(['meeting_url' => $request->meetingUrl()]);
        Inertia::flash('toast', ['type' => 'success', 'message' => __('courses.session_saved', [], 'fr')]);

        return back();
    }
}
