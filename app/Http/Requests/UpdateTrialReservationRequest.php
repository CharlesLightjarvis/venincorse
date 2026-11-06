<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateTrialReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('reservation')) ?? false;
    }

    public function rules(): array
    {
        return ['notes' => ['nullable', 'string', 'max:5000']];
    }

    public function messages(): array
    {
        return ['notes.*' => __('trials.notes_invalid', [], 'fr')];
    }
}
