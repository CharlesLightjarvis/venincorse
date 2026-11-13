<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\CourseAttendanceStatus;
use App\Models\CourseSession;
use App\Models\CourseSessionAttendance;
use Illuminate\Support\Facades\DB;

/** The teacher records who attended a session; the list replaces the previous call for that session. */
final readonly class RecordCourseSessionAttendance
{
    /** @param array<string, CourseAttendanceStatus> $attendances */
    public function handle(CourseSession $session, array $attendances): void
    {
        DB::transaction(function () use ($session, $attendances): void {
            foreach ($attendances as $enrollmentId => $status) {
                CourseSessionAttendance::query()->updateOrCreate(
                    [
                        'course_session_id' => $session->id,
                        'course_enrollment_id' => $enrollmentId,
                    ],
                    ['status' => $status],
                );
            }

            $session->attendances()
                ->whereNotIn('course_enrollment_id', array_keys($attendances))
                ->delete();
        });
    }
}
