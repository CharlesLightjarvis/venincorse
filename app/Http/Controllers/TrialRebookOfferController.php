<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateTrialRebookOffer;
use App\Models\TrialReservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

final readonly class TrialRebookOfferController
{
    public function store(TrialReservation $reservation, CreateTrialRebookOffer $createOffer): RedirectResponse
    {
        if (! $createOffer->handle($reservation)) {
            throw ValidationException::withMessages(['rebook' => __('trials.rebook_unavailable', [], 'fr')]);
        }
        Inertia::flash('toast', ['type' => 'success', 'message' => __('trials.rebook_offered', [], 'fr')]);

        return back();
    }
}
