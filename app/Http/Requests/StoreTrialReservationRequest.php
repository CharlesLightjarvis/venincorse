<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\PermissionEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StoreTrialReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(PermissionEnum::ReserveTrial->value) ?? false;
    }

    public function rules(): array
    {
        return [
            'slot_id' => ['required', 'integer', 'exists:trial_slots,id'],
            'level' => ['required', Rule::in(['unknown', 'a1', 'a2', 'b1', 'b2'])],
            'goal' => ['required', 'string', 'min:5', 'max:2000', 'regex:/(?:\p{L}.*){3}/su'],
            'timezone' => ['required', 'timezone:all_with_bc'],
            'terms' => ['required', 'accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'slot_id.required' => __('trials.slot_required', [], 'fr'),
            'slot_id.integer' => __('trials.slot_unavailable', [], 'fr'),
            'slot_id.exists' => __('trials.slot_unavailable', [], 'fr'),
            'level.*' => __('trials.level_invalid', [], 'fr'),
            'goal.*' => __('trials.goal_invalid', [], 'fr'),
            'timezone.*' => __('trials.timezone_invalid', [], 'fr'),
            'terms.*' => __('trials.terms_required', [], 'fr'),
        ];
    }
}
