<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\UpdateEndedTrialSessions;
use App\Actions\UpdateTrialReservation;
use App\Enums\TrialReservationCategory;
use App\Http\Requests\UpdateTrialReservationRequest;
use App\Http\Resources\TrialReservationResource;
use App\Models\TrialReservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final readonly class TrialManagementController
{
    public function index(Request $request, UpdateEndedTrialSessions $updateEnded): Response
    {
        $updateEnded->handle();
        $category = TrialReservationCategory::tryFrom((string) $request->query('category'));
        $reservations = TrialReservation::query()->with(['slot', 'user'])
            ->when($category, fn ($query) => $category->scope($query));

        return Inertia::render('trials/manage', [
            'category' => $category?->value,
            'counts' => collect(TrialReservationCategory::cases())->mapWithKeys(fn (TrialReservationCategory $case): array => [
                $case->value => $case->scope(TrialReservation::query())->count(),
            ]),
            'reservations' => Inertia::scroll(TrialReservationResource::collection(
                TrialReservationCategory::order($reservations, $category)->paginate(24)->withQueryString(),
            )),
        ]);
    }

    public function show(Request $request, TrialReservation $reservation, UpdateEndedTrialSessions $updateEnded): Response
    {
        $updateEnded->handle();

        return Inertia::render('trials/manage-show', [
            'reservation' => TrialReservationResource::make($reservation->refresh()->load(['slot', 'user']))->resolve($request),
        ]);
    }

    public function update(UpdateTrialReservationRequest $request, TrialReservation $reservation, UpdateTrialReservation $updateReservation): RedirectResponse
    {
        $updateReservation->handle($reservation, $request->safe()->only(['notes', 'meeting_url']));
        Inertia::flash('toast', ['type' => 'success', 'message' => __('trials.reservation_saved', [], 'fr')]);

        return back();
    }
}
