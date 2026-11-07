<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\PermissionEnum;
use App\Models\CourseCohort;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

final class UpdateCourseCohortRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(PermissionEnum::ManageCourses->value) ?? false;
    }

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        /** @var CourseCohort $cohort */
        $cohort = $this->route('cohort');

        return [
            'meeting_url' => ['nullable', 'string', 'url:https', 'max:2048'],
            'capacity' => ['required', 'integer', 'min:1', 'max:'.$cohort->format->maxCapacity()],
            'is_published' => ['required', 'boolean'],
        ];
    }

    /** @return list<callable(Validator): void> */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                /** @var CourseCohort $cohort */
                $cohort = $this->route('cohort');
                $taken = $cohort->enrollments()->holdingSeat()->count();
                if ($this->integer('capacity') < $taken) {
                    $validator->errors()->add('capacity', __('courses.capacity_below_enrolled', ['count' => $taken], 'fr'));
                }
            },
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        /** @var CourseCohort $cohort */
        $cohort = $this->route('cohort');

        return [
            'meeting_url.*' => __('courses.meeting_url_invalid', [], 'fr'),
            'capacity.*' => __('courses.capacity_invalid', ['max' => $cohort->format->maxCapacity()], 'fr'),
        ];
    }

    /** @return array{meeting_url: ?string, capacity: int, is_published: bool} */
    public function changes(): array
    {
        return [
            'meeting_url' => $this->input('meeting_url') ?: null,
            'capacity' => $this->integer('capacity'),
            'is_published' => $this->boolean('is_published'),
        ];
    }
}
