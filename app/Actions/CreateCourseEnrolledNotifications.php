<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\PermissionEnum;
use App\Models\CourseEnrollment;
use App\Models\User;
use App\Notifications\CourseEnrolled;
use App\Notifications\CourseEnrolledForTeacher;
use Illuminate\Support\Facades\Notification;

/** Confirms the enrollment to the student and tells the teaching team (queued, never blocking). */
final readonly class CreateCourseEnrolledNotifications
{
    public function handle(CourseEnrollment $enrollment): void
    {
        $enrollment->loadMissing(['cohort', 'user']);
        $enrollment->user->notify(new CourseEnrolled($enrollment));
        Notification::send(
            User::permission(PermissionEnum::ManageCourses->value)->get(),
            new CourseEnrolledForTeacher($enrollment),
        );
    }
}
