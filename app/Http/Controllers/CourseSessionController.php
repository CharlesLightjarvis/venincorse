<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\UpdateCourseSession;
use App\Http\Requests\UpdateCourseSessionRequest;
use App\Models\CourseSession;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

final readonly class CourseSessionController
{
    /** The teacher changes one session: its own visio link, its date and hour, or cancels it. */
    public function update(UpdateCourseSessionRequest $request, CourseSession $session, UpdateCourseSession $updateSession): RedirectResponse
    {
        $updateSession->handle($session, $request->changes());
        Inertia::flash('toast', ['type' => 'success', 'message' => __('courses.session_saved', [], 'fr')]);

        return back();
    }
}
