<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateTrialSlotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('changeOwn', $this->route('reservation')) ?? false;
    }

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return ['slot_id' => ['required', 'integer']];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return ['slot_id.*' => __('trials.slot_required', [], 'fr')];
    }
}
