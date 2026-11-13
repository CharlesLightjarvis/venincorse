<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\PermissionEnum;
use App\Models\CourseSession;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

final class UpdateCourseSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(PermissionEnum::ManageCourses->value) ?? false;
    }

    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'meeting_url' => ['nullable', 'string', 'url:https', 'max:2048'],
            'starts_at' => ['nullable', 'date'],
            'is_cancelled' => ['sometimes', 'boolean'],
            'cancellation_reason' => [
                'nullable', 'string', 'min:5', 'max:500',
                Rule::requiredIf(fn (): bool => $this->boolean('is_cancelled')),
            ],
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

                if ($session->cohort->isCancelled()) {
                    $validator->errors()->add('session', __('courses.session_locked', [], 'fr'));

                    return;
                }

                if ($this->has('starts_at') && $this->filled('starts_at')) {
                    $startsAt = CarbonImmutable::parse($this->input('starts_at'));
                    if (! $session->starts_at->isFuture() && ! $startsAt->equalTo($session->starts_at)) {
                        $validator->errors()->add('starts_at', __('courses.session_already_past', [], 'fr'));

                        return;
                    }
                    if (! $startsAt->equalTo($session->starts_at) && ! $startsAt->isFuture()) {
                        $validator->errors()->add('starts_at', __('courses.session_starts_at_invalid', [], 'fr'));
                    }
                }

                if ($this->boolean('is_cancelled') && ! $session->starts_at->isFuture()) {
                    $validator->errors()->add('is_cancelled', __('courses.session_cancellation_too_late', [], 'fr'));
                }
            },
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'meeting_url.*' => __('courses.meeting_url_invalid', [], 'fr'),
            'starts_at.*' => __('courses.session_starts_at_invalid', [], 'fr'),
            'cancellation_reason.*' => __('courses.session_cancellation_reason_invalid', [], 'fr'),
        ];
    }

    /**
     * Only the fields actually sent are changed, so the link form never touches the date or the cancellation.
     *
     * @return array{meeting_url?: ?string, starts_at?: CarbonImmutable, is_cancelled?: bool, cancellation_reason?: ?string}
     */
    public function changes(): array
    {
        $changes = [];

        if ($this->has('meeting_url')) {
            $changes['meeting_url'] = $this->input('meeting_url') ?: null;
        }

        if ($this->has('starts_at') && $this->filled('starts_at')) {
            $changes['starts_at'] = CarbonImmutable::parse($this->input('starts_at'));
        }

        if ($this->has('is_cancelled')) {
            $changes['is_cancelled'] = $this->boolean('is_cancelled');
            $changes['cancellation_reason'] = $this->boolean('is_cancelled')
                ? $this->string('cancellation_reason')->trim()->toString()
                : null;
        }

        return $changes;
    }
}
