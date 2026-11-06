<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateTrialReservation;
use App\Actions\ReconcileTrialPayment;
use App\Enums\TrialReservationStatus;
use App\Http\Requests\StoreTrialReservationRequest;
use App\Http\Resources\TrialReservationResource;
use App\Models\TrialReservation;
use App\Queries\AvailableTrialSlots;
use App\Services\TrialPaymentGateway;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

final readonly class TrialReservationController
{
    public function create(Request $request, AvailableTrialSlots $slots, TrialPaymentGateway $gateway, ReconcileTrialPayment $reconcile): Response
    {
        $this->reconcileUnfinished($request, $reconcile);

        return Inertia::render('trials/create', [
            'slots' => $slots->get()->map(fn ($slot): array => ['id' => $slot->id, 'starts_at' => $slot->starts_at->toIso8601String()]),
            'selectedSlotId' => $request->integer('slot') ?: null,
            'selectedTimezone' => in_array($request->query('timezone'), \DateTimeZone::listIdentifiers(\DateTimeZone::ALL_WITH_BC), true)
                ? $request->query('timezone') : null,
            'submissionKey' => (string) Str::uuid(),
            'checkoutKey' => (string) Str::uuid(),
            'paymentReady' => $gateway->ready(),
            'amountCents' => config('trials.amount_cents'),
            'currency' => config('trials.currency'),
            'bookedTrial' => $this->summary($this->bookedTrial($request)),
            'pendingPayment' => $this->summary($this->pendingPayment($request)),
        ]);
    }

    /** A payment completed at Stripe must show up as soon as the student is back, even without a webhook. */
    private function reconcileUnfinished(Request $request, ReconcileTrialPayment $reconcile): void
    {
        if ($request->user() === null) {
            return;
        }
        TrialReservation::query()
            ->where('user_id', $request->user()->id)
            ->whereIn('status', [TrialReservationStatus::Pending, TrialReservationStatus::Processing])
            ->whereNotNull('stripe_session_id')
            ->latest()
            ->limit(3)
            ->get()
            ->each(fn (TrialReservation $reservation) => $reconcile->handle($reservation));
    }

    private function bookedTrial(Request $request): ?TrialReservation
    {
        return $request->user() === null ? null : TrialReservation::query()->with('slot')
            ->where('user_id', $request->user()->id)
            ->whereIn('status', TrialReservationStatus::bookedCases())
            ->latest()
            ->first();
    }

    private function pendingPayment(Request $request): ?TrialReservation
    {
        return $request->user() === null ? null : TrialReservation::query()->with('slot')
            ->where('user_id', $request->user()->id)
            ->where('status', TrialReservationStatus::Pending)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();
    }

    /** @return array{id: string, starts_at: string, status: string, expires_at: string}|null */
    private function summary(?TrialReservation $reservation): ?array
    {
        return $reservation === null ? null : [
            'id' => $reservation->id,
            'starts_at' => $reservation->slot->starts_at->toIso8601String(),
            'status' => $reservation->status->value,
            'expires_at' => $reservation->expires_at->toIso8601String(),
        ];
    }

    public function store(StoreTrialReservationRequest $request, CreateTrialReservation $action): JsonResponse
    {
        $reservation = $action->handle($request->user(), [
            'slot_id' => $request->integer('slot_id'), 'level' => $request->string('level')->toString(),
            'goal' => $request->string('goal')->toString(), 'timezone' => $request->string('timezone')->toString(),
        ], $request->attributes->get('submission_key'));

        return response()->json(['reservation_id' => $reservation->id], 201);
    }

    public function show(Request $request, TrialReservation $reservation, TrialPaymentGateway $gateway, ReconcileTrialPayment $reconcile): Response
    {
        Gate::authorize('view', $reservation);
        $reconcile->handle($reservation, force: $request->boolean('refresh'));

        return Inertia::render('trials/show', [
            'reservation' => (new TrialReservationResource($reservation->load(['slot', 'user'])))->resolve($request),
            'paymentReady' => $gateway->ready(),
            'submissionKey' => (string) Str::uuid(),
        ]);
    }

    public function index(Request $request, ReconcileTrialPayment $reconcile): Response
    {
        $this->reconcileUnfinished($request, $reconcile);
        $bookedTrial = $this->bookedTrial($request);
        $pendingPayment = $bookedTrial ? null : $this->pendingPayment($request);
        $history = TrialReservation::query()->with('slot')
            ->where('user_id', $request->user()->id)
            ->whereNotIn('id', array_filter([$bookedTrial?->id, $pendingPayment?->id]))
            ->whereNotIn('status', TrialReservationStatus::bookedCases())
            ->orderByDesc('created_at')->orderByDesc('id')
            ->limit(10)
            ->get();

        return Inertia::render('trials/index', [
            'bookedTrial' => $bookedTrial ? TrialReservationResource::make($bookedTrial)->resolve($request) : null,
            'pendingPayment' => $pendingPayment ? TrialReservationResource::make($pendingPayment)->resolve($request) : null,
            'history' => TrialReservationResource::collection($history)->resolve($request),
        ]);
    }

    public function dashboard(Request $request, ReconcileTrialPayment $reconcile): Response
    {
        $this->reconcileUnfinished($request, $reconcile);
        $query = TrialReservation::query()->where('user_id', $request->user()->id);

        return Inertia::render('dashboard', [
            'reservations' => TrialReservationResource::collection((clone $query)->with('slot')->orderByDesc('created_at')->orderByDesc('id')->paginate(10)),
            'overview' => [
                'confirmed' => (clone $query)->where('status', TrialReservationStatus::Confirmed)->count(),
                'pending' => (clone $query)->where(fn ($unfinished) => $unfinished
                    ->where(fn ($pending) => $pending->where('status', TrialReservationStatus::Pending)->where('expires_at', '>', now()))
                    ->orWhere('status', TrialReservationStatus::Processing))
                    ->count(),
                'paidCents' => (clone $query)->where('status', TrialReservationStatus::Confirmed)->sum('amount_cents'),
            ],
        ]);
    }
}
