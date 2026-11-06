<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\UpdateTrialPaymentReview;
use App\Exceptions\TrialRefundFailed;
use App\Http\Requests\UpdateTrialPaymentReviewRequest;
use App\Models\TrialReservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

final readonly class TrialPaymentReviewController
{
    public function update(UpdateTrialPaymentReviewRequest $request, TrialReservation $reservation, UpdateTrialPaymentReview $updateReview): RedirectResponse
    {
        $reservation->load('slot');
        if ($request->confirms()) {
            if (! $updateReview->confirm($reservation)) {
                throw ValidationException::withMessages(['decision' => __('trials.review_confirm_unavailable', [], 'fr')]);
            }
            Inertia::flash('toast', ['type' => 'success', 'message' => __('trials.review_confirmed', [], 'fr')]);

            return back();
        }
        if ($request->releases()) {
            if (! $updateReview->release($reservation)) {
                throw ValidationException::withMessages(['decision' => __('trials.review_release_unavailable', [], 'fr')]);
            }
            Inertia::flash('toast', ['type' => 'success', 'message' => __('trials.review_released', [], 'fr')]);

            return back();
        }
        try {
            $refunded = $updateReview->refund($reservation);
        } catch (TrialRefundFailed) {
            $refunded = false;
        }
        if (! $refunded) {
            throw ValidationException::withMessages(['decision' => __('trials.review_refund_failed', [], 'fr')]);
        }
        Inertia::flash('toast', ['type' => 'success', 'message' => __('trials.review_refunded', [], 'fr')]);

        return back();
    }
}
