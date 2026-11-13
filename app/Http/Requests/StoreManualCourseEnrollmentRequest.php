<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\CoursePaymentMethod;
use App\Enums\PermissionEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StoreManualCourseEnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(PermissionEnum::ManageCourses->value) ?? false;
    }

    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        $method = CoursePaymentMethod::tryFrom((string) $this->input('payment_method'));

        return [
            'email' => ['required', 'email', 'exists:users,email'],
            'cohort_id' => ['required', 'integer', 'exists:course_cohorts,id'],
            'payment_method' => ['required', Rule::enum(CoursePaymentMethod::class), Rule::notIn([CoursePaymentMethod::Stripe->value])],
            'payment_reference' => [
                'nullable',
                'string',
                'max:255',
                Rule::requiredIf($method?->isManual() === true && $method !== CoursePaymentMethod::Offer),
            ],
            'goal' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'email.*' => __('courses.manual_enrollment_email_invalid', [], 'fr'),
            'cohort_id.*' => __('courses.manual_enrollment_cohort_invalid', [], 'fr'),
            'payment_method.*' => __('courses.manual_enrollment_method_invalid', [], 'fr'),
            'payment_reference.*' => __('courses.manual_enrollment_reference_invalid', [], 'fr'),
            'goal.*' => __('courses.goal_invalid', [], 'fr'),
        ];
    }
}
