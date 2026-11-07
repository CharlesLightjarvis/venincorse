<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\PermissionEnum;
use Illuminate\Foundation\Http\FormRequest;

final class CreateCourseEnrollmentCancellationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(PermissionEnum::ManageCourses->value) ?? false;
    }

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'refund_cents' => ['required', 'integer', 'min:0'],
            'reason' => ['required', 'string', 'min:5', 'max:500'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'refund_cents.*' => __('courses.refund_invalid', [], 'fr'),
            'reason.*' => __('courses.cancellation_reason_invalid', [], 'fr'),
        ];
    }
}
