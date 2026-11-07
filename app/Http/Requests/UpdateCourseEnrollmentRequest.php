<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\PermissionEnum;
use Illuminate\Foundation\Http\FormRequest;

final class UpdateCourseEnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(PermissionEnum::ManageCourses->value) ?? false;
    }

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return ['notes' => ['nullable', 'string', 'max:5000']];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return ['notes.*' => __('courses.notes_invalid', [], 'fr')];
    }
}
