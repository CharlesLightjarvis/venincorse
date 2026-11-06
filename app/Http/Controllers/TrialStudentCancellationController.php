<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateTrialCancellation;
use App\Exceptions\TrialRefundFailed;
use App\Models\TrialReservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

final readonly class TrialStudentCancellationController
{
    public function store(TrialReservation $reservation, CreateTrialCancellation $createCancellation): RedirectResponse
    {
        Gate::authorize('changeOwn', $reservation);
        try {
            $cancelled = $createCancellation->handle(
                $reservation->load('slot'),
                __('trials.student_cancellation_reason', [], 'fr'),
                CreateTrialCancellation::ByStudent,
            );
        } catch (TrialRefundFailed) {
            throw ValidationException::withMessages(['cancellation' => __('trials.student_cancellation_failed', [], 'fr')]);
        }
        if (! $cancelled) {
            throw ValidationException::withMessages(['cancellation' => __('trials.student_cancellation_unavailable', [], 'fr')]);
        }
        Inertia::flash('toast', ['type' => 'success', 'message' => __('trials.student_cancelled', [], 'fr')]);

        return to_route('trial-reservations.index');
    }
}
