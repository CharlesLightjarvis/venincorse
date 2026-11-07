<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\CourseFormat;
use App\Enums\CourseLevel;
use App\Enums\CourseRhythm;
use App\Enums\PermissionEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StoreCourseCohortRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(PermissionEnum::ManageCourses->value) ?? false;
    }

    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'level' => ['required', Rule::enum(CourseLevel::class)],
            'format' => ['required', Rule::enum(CourseFormat::class)],
            'rhythm' => ['required', Rule::enum(CourseRhythm::class)],
            'starts_on' => ['required', 'date_format:Y-m-d', 'after:today'],
            'start_hour' => ['required', 'integer', Rule::in(config('courses.session_start_hours'))],
            'capacity' => ['required', 'integer', 'min:1', 'max:'.CourseFormat::Group->maxCapacity()],
            'skipped_dates' => ['present', 'array', 'max:60'],
            'skipped_dates.*' => ['date_format:Y-m-d', 'distinct'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'level.*' => __('courses.level_invalid', [], 'fr'),
            'format.*' => __('courses.format_invalid', [], 'fr'),
            'rhythm.*' => __('courses.rhythm_invalid', [], 'fr'),
            'starts_on.*' => __('courses.starts_on_invalid', [], 'fr'),
            'start_hour.*' => __('courses.start_hour_invalid', [], 'fr'),
            'capacity.*' => __('courses.capacity_invalid', ['max' => CourseFormat::Group->maxCapacity()], 'fr'),
            'skipped_dates.*' => __('courses.skipped_dates_invalid', [], 'fr'),
        ];
    }

    /** @return array{level: CourseLevel, format: CourseFormat, rhythm: CourseRhythm, starts_on: string, start_hour: int, capacity: int, skipped_dates: list<string>} */
    public function cohort(): array
    {
        return [
            'level' => $this->enum('level', CourseLevel::class),
            'format' => $this->enum('format', CourseFormat::class),
            'rhythm' => $this->enum('rhythm', CourseRhythm::class),
            'starts_on' => $this->string('starts_on')->toString(),
            'start_hour' => $this->integer('start_hour'),
            'capacity' => $this->integer('capacity'),
            'skipped_dates' => array_values(array_map('strval', (array) $this->input('skipped_dates', []))),
        ];
    }
}
