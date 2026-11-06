<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\TrialReservationStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateTrialOutcomeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('reservation')) ?? false;
    }

    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'outcome' => ['required', Rule::in([TrialReservationStatus::Completed->value, TrialReservationStatus::NoShow->value])],
            'summary' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'outcome.*' => __('trials.outcome_invalid', [], 'fr'),
            'summary.*' => __('trials.summary_invalid', [], 'fr'),
        ];
    }

    public function summary(): ?string
    {
        $summary = trim((string) $this->input('summary'));

        return $summary === '' ? null : $summary;
    }

    public function outcome(): TrialReservationStatus
    {
        return TrialReservationStatus::from($this->string('outcome')->toString());
    }
}
