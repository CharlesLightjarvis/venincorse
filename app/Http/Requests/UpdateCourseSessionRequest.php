<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\PermissionEnum;
use Illuminate\Foundation\Http\FormRequest;

final class UpdateCourseSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(PermissionEnum::ManageCourses->value) ?? false;
    }

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'meeting_url' => ['nullable', 'string', 'url:https', 'max:2048'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'meeting_url.*' => __('courses.meeting_url_invalid', [], 'fr'),
        ];
    }

    public function meetingUrl(): ?string
    {
        return $this->input('meeting_url') ?: null;
    }
}
