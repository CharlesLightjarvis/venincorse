<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\CourseAttendanceStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Whether one student attended one session, recorded by the teacher after the class. */
#[Fillable(['course_session_id', 'course_enrollment_id', 'status'])]
final class CourseSessionAttendance extends Model
{
    protected function casts(): array
    {
        return ['status' => CourseAttendanceStatus::class];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(CourseSession::class, 'course_session_id');
    }

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(CourseEnrollment::class, 'course_enrollment_id');
    }
}
