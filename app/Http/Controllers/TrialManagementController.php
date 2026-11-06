<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\UpdateTrialReservationRequest;
use App\Http\Resources\TrialReservationResource;
use App\Models\TrialReservation;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final readonly class TrialManagementController
{
    public function index(): Response
    {
        return Inertia::render('trials/manage', [
            'reservations' => TrialReservationResource::collection(TrialReservation::query()->with(['slot', 'user'])
                ->orderByDesc('created_at')->orderByDesc('id')->paginate(20)),
        ]);
    }

    public function update(UpdateTrialReservationRequest $request, TrialReservation $reservation): RedirectResponse
    {
        $reservation->update(['notes' => $request->validated('notes')]);

        return back();
    }
}
