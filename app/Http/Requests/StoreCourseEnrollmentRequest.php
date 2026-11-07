<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\PermissionEnum;
use App\Models\CourseCohort;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

final class StoreCourseEnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(PermissionEnum::EnrollInCourses->value) ?? false;
    }

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'cohort_id' => ['required', 'integer', 'exists:course_cohorts,id'],
            'goal' => ['required', 'string', 'min:5', 'max:2000', 'regex:/(?:\p{L}.*){3}/su'],
            'timezone' => ['required', 'timezone:all_with_bc'],
            'terms' => ['required', 'accepted'],
            'early_start' => ['boolean'],
        ];
    }

    /**
     * A course starting within the 14-day withdrawal period may only start early at the student's express request
     * (Code de la consommation, art. L221-25).
     *
     * @return list<callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $cohort = $this->cohort();
                if ($cohort && $this->startsWithinWithdrawalPeriod($cohort) && ! $this->boolean('early_start')) {
                    $validator->errors()->add('early_start', __('courses.early_start_required', [], 'fr'));
                }
            },
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'cohort_id.*' => __('courses.cohort_unavailable', [], 'fr'),
            'goal.*' => __('courses.goal_invalid', [], 'fr'),
            'timezone.*' => __('courses.timezone_invalid', [], 'fr'),
            'terms.*' => __('courses.terms_required', [], 'fr'),
        ];
    }

    public function cohort(): ?CourseCohort
    {
        return CourseCohort::query()->find($this->integer('cohort_id'));
    }

    public static function startsWithinWithdrawalPeriod(CourseCohort $cohort): bool
    {
        return $cohort->starts_at->lt(now()->addDays((int) config('courses.withdrawal_days')));
    }

    /** @return array{goal: string, timezone: string, early_start: bool} */
    public function enrollment(): array
    {
        return [
            'goal' => $this->string('goal')->toString(),
            'timezone' => $this->string('timezone')->toString(),
            'early_start' => $this->boolean('early_start'),
        ];
    }
}
