<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\CourseAttendanceStatus;
use App\Enums\CourseEnrollmentStatus;
use App\Enums\PermissionEnum;
use App\Models\CourseSession;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

final class UpdateCourseSessionAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(PermissionEnum::ManageCourses->value) ?? false;
    }

    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'attendances' => ['required', 'array', 'min:1'],
            'attendances.*' => ['required', Rule::enum(CourseAttendanceStatus::class)],
        ];
    }

    /** @return list<callable(Validator): void> */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                /** @var CourseSession $session */
                $session = $this->route('session');
                $session->loadMissing('cohort');

                if ($session->cohort->isCancelled() || $session->isCancelled()) {
                    $validator->errors()->add('attendances', __('courses.attendance_session_cancelled', [], 'fr'));

                    return;
                }

                if (! $session->starts_at->isPast()) {
                    $validator->errors()->add('attendances', __('courses.attendance_too_early', [], 'fr'));

                    return;
                }

                $enrollmentIds = $session->cohort->enrollments()
                    ->where('status', CourseEnrollmentStatus::Confirmed)
                    ->pluck('id')
                    ->all();
                foreach (array_keys((array) $this->input('attendances', [])) as $enrollmentId) {
                    if (! in_array($enrollmentId, $enrollmentIds, true)) {
                        $validator->errors()->add('attendances', __('courses.attendance_invalid_student', [], 'fr'));

                        return;
                    }
                }
            },
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'attendances.*' => __('courses.attendance_invalid', [], 'fr'),
        ];
    }

    /** @return array<string, CourseAttendanceStatus> */
    public function attendances(): array
    {
        return array_map(
            fn (string $status): CourseAttendanceStatus => CourseAttendanceStatus::from($status),
            (array) $this->input('attendances'),
        );
    }
}
