<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateTrialCancellation;
use App\Exceptions\TrialRefundFailed;
use App\Http\Requests\CreateTrialCancellationRequest;
use App\Models\TrialReservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

final readonly class TrialCancellationController
{
    public function store(CreateTrialCancellationRequest $request, TrialReservation $reservation, CreateTrialCancellation $createCancellation): RedirectResponse
    {
        try {
            $cancelled = $createCancellation->handle(
                $reservation->load('slot'),
                $request->string('reason')->trim()->toString(),
                CreateTrialCancellation::ByTeacher,
            );
        } catch (TrialRefundFailed) {
            throw ValidationException::withMessages(['reason' => __('trials.cancellation_refund_failed', [], 'fr')]);
        }
        if (! $cancelled) {
            throw ValidationException::withMessages(['reason' => __('trials.cancellation_unavailable', [], 'fr')]);
        }
        Inertia::flash('toast', ['type' => 'success', 'message' => __('trials.cancelled', [], 'fr')]);

        return back();
    }
}
