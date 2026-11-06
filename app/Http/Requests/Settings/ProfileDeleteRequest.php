<?php

namespace App\Http\Requests\Settings;

use App\Concerns\PasswordValidationRules;
use App\Enums\TrialReservationStatus;
use App\Models\TrialReservation;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class ProfileDeleteRequest extends FormRequest
{
    use PasswordValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'password' => $this->currentPasswordRules(),
        ];
    }

    /**
     * An account with a trial being paid or still to come cannot be deleted: it must be cancelled first.
     *
     * @return list<callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $hasActiveTrial = TrialReservation::query()
                    ->where('user_id', $this->user()->id)
                    ->where(fn ($query) => $query
                        ->whereIn('status', [
                            TrialReservationStatus::Processing,
                            TrialReservationStatus::Confirmed,
                            TrialReservationStatus::Ended,
                            TrialReservationStatus::PaymentReview,
                        ])
                        ->orWhere(fn ($query) => $query
                            ->where('status', TrialReservationStatus::Pending)
                            ->where('expires_at', '>', now())))
                    ->exists();
                if ($hasActiveTrial) {
                    $validator->errors()->add('password', __('trials.account_has_active_trial', [], 'fr'));
                }
            },
        ];
    }
}
