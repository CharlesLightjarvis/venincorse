<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\UpdateTrialReservationRequest;
use App\Http\Resources\TrialReservationResource;
use App\Models\TrialReservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final readonly class TrialManagementController
{
    public function index(Request $request): Response
    {
        return Inertia::render('trials/manage', [
            'reservations' => TrialReservationResource::collection(TrialReservation::query()->with(['slot', 'user'])
                ->orderByDesc('created_at')->orderByDesc('id')->limit(100)->get())->resolve($request),
        ]);
    }

    public function update(UpdateTrialReservationRequest $request, TrialReservation $reservation): RedirectResponse
    {
        $reservation->update($request->safe()->only(['notes', 'meeting_url']));

        return back();
    }
}
