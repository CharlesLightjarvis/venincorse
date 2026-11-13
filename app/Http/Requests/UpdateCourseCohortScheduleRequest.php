<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\CourseRhythm;
use App\Enums\PermissionEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateCourseCohortScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(PermissionEnum::ManageCourses->value) ?? false;
    }

    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'rhythm' => ['required', Rule::enum(CourseRhythm::class)],
            'starts_on' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'start_hour' => ['required', 'integer', Rule::in(config('courses.session_start_hours'))],
            'skipped_dates' => ['sometimes', 'array', 'max:60'],
            'skipped_dates.*' => ['date_format:Y-m-d', 'distinct'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'rhythm.*' => __('courses.rhythm_invalid', [], 'fr'),
            'starts_on.*' => __('courses.schedule_starts_on_invalid', [], 'fr'),
            'start_hour.*' => __('courses.start_hour_invalid', [], 'fr'),
            'skipped_dates.*' => __('courses.skipped_dates_invalid', [], 'fr'),
        ];
    }

    /** @return array{rhythm: CourseRhythm, starts_on: string, start_hour: int, skipped_dates: list<string>} */
    public function schedule(): array
    {
        return [
            'rhythm' => $this->enum('rhythm', CourseRhythm::class),
            'starts_on' => $this->string('starts_on')->toString(),
            'start_hour' => $this->integer('start_hour'),
            'skipped_dates' => array_values(array_map('strval', (array) $this->input('skipped_dates', []))),
        ];
    }
}
