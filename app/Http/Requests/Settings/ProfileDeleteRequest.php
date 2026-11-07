<?php

namespace App\Http\Requests\Settings;

use App\Concerns\PasswordValidationRules;
use App\Enums\CourseEnrollmentStatus;
use App\Enums\CourseInstallmentStatus;
use App\Enums\TrialReservationStatus;
use App\Models\CourseEnrollment;
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

                    return;
                }
                $hasActiveCourse = CourseEnrollment::query()
                    ->where('user_id', $this->user()->id)
                    ->where(fn ($query) => $query
                        ->whereIn('status', [CourseEnrollmentStatus::Processing, CourseEnrollmentStatus::PaymentReview])
                        ->orWhere(fn ($query) => $query->where('status', CourseEnrollmentStatus::Pending)->where('expires_at', '>', now()))
                        ->orWhere(fn ($query) => $query->where('status', CourseEnrollmentStatus::Confirmed)
                            ->where(fn ($query) => $query
                                ->whereHas('cohort', fn ($cohort) => $cohort->where('ends_at', '>', now()))
                                ->orWhereHas('installments', fn ($installments) => $installments
                                    ->whereIn('status', [CourseInstallmentStatus::Scheduled, CourseInstallmentStatus::Failed])))))
                    ->exists();
                if ($hasActiveCourse) {
                    $validator->errors()->add('password', __('courses.account_has_active_course', [], 'fr'));
                }
            },
        ];
    }
}
