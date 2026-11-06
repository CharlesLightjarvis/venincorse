<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\UpdateTrialOutcome;
use App\Http\Requests\UpdateTrialOutcomeRequest;
use App\Models\TrialReservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

final readonly class TrialOutcomeController
{
    public function update(UpdateTrialOutcomeRequest $request, TrialReservation $reservation, UpdateTrialOutcome $updateOutcome): RedirectResponse
    {
        if (! $updateOutcome->handle($reservation->load('slot'), $request->outcome(), $request->summary())) {
            throw ValidationException::withMessages(['outcome' => __('trials.outcome_unavailable', [], 'fr')]);
        }
        Inertia::flash('toast', ['type' => 'success', 'message' => __('trials.outcome_saved', [], 'fr')]);

        return back();
    }
}
