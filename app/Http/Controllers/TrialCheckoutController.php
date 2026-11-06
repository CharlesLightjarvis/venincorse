<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateTrialCheckout;
use App\Models\TrialReservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use KenDeNigerian\PayZephyr\Exceptions\PaymentException;
use Stripe\Exception\ApiErrorException;

final readonly class TrialCheckoutController
{
    public function store(TrialReservation $reservation, CreateTrialCheckout $action): JsonResponse
    {
        Gate::authorize('checkout', $reservation);
        try {
            return response()->json(['checkout_url' => $action->handle($reservation)]);
        } catch (ApiErrorException|PaymentException $exception) {
            report($exception);
            throw ValidationException::withMessages(['payment' => __('trials.payment_failed', [], 'fr')]);
        }
    }
}
