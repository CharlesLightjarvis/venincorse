<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateTrialPaymentReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('reservation')) ?? false;
    }

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return ['decision' => ['required', 'in:confirm,refund,release']];
    }

    public function releases(): bool
    {
        return $this->input('decision') === 'release';
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return ['decision.*' => __('trials.review_invalid', [], 'fr')];
    }

    public function confirms(): bool
    {
        return $this->input('decision') === 'confirm';
    }
}
