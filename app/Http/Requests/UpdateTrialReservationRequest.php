<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\TrialReservation;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

final class UpdateTrialReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('reservation')) ?? false;
    }

    public function rules(): array
    {
        return [
            'notes' => ['nullable', 'string', 'max:5000'],
            'meeting_url' => ['nullable', 'string', 'url:https', 'max:2048'],
        ];
    }

    /** The visio link is frozen once the trial will not take place (expired, refunded, cancelled) or has ended. */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $reservation = $this->route('reservation');
                if ($this->has('meeting_url') && $reservation instanceof TrialReservation
                    && $this->input('meeting_url') !== $reservation->meeting_url
                    && ! $reservation->canReceiveMeetingLink()) {
                    $validator->errors()->add('meeting_url', __('trials.meeting_url_inactive', [], 'fr'));
                }
            },
        ];
    }

    public function messages(): array
    {
        return [
            'notes.*' => __('trials.notes_invalid', [], 'fr'),
            'meeting_url.*' => __('trials.meeting_url_invalid', [], 'fr'),
        ];
    }
}
