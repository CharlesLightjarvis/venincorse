<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\PermissionEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

final class UpdateTrialAvailabilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(PermissionEnum::ManageAvailability->value) ?? false;
    }

    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'weekdays' => ['required', 'array', 'min:1'],
            'weekdays.*' => ['integer', 'between:0,6', 'distinct'],
            'hours' => ['required', 'array', 'min:1'],
            'hours.*' => ['integer', Rule::in(config('trials.selectable_hours')), 'distinct'],
            'closed_dates' => ['present', 'array', 'max:60'],
            'closed_dates.*' => ['date_format:Y-m-d', 'after_or_equal:today', 'distinct'],
        ];
    }

    /** A 60-minute session plus at least 60 minutes of pause between two proposed starts. */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->has('hours') || $validator->errors()->has('hours.*')) {
                    return;
                }
                $hours = $this->hours();
                for ($index = 1; $index < count($hours); $index++) {
                    if ($hours[$index] - $hours[$index - 1] < 2) {
                        $validator->errors()->add('hours', __('trials.availability_hours_gap', [], 'fr'));

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
            'weekdays.*' => __('trials.availability_weekdays', [], 'fr'),
            'hours.*' => __('trials.availability_hours', [], 'fr'),
            'closed_dates.*' => __('trials.availability_closed_dates', [], 'fr'),
        ];
    }

    /** @return list<int> */
    public function weekdays(): array
    {
        return $this->sortedIntegers('weekdays');
    }

    /** @return list<int> */
    public function hours(): array
    {
        return $this->sortedIntegers('hours');
    }

    /** @return list<string> */
    public function closedDates(): array
    {
        $dates = array_values(array_unique(array_map('strval', (array) $this->input('closed_dates', []))));
        sort($dates);

        return $dates;
    }

    /** @return list<int> */
    private function sortedIntegers(string $key): array
    {
        $values = array_values(array_unique(array_map('intval', (array) $this->input($key, []))));
        sort($values);

        return $values;
    }
}
