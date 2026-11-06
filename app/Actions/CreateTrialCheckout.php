<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\TrialReservationStatus;
use App\Models\TrialReservation;
use App\Services\TrialPaymentGateway;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;

final readonly class CreateTrialCheckout
{
    public function __construct(
        private TrialPaymentGateway $gateway,
        private ReconcileTrialPayment $reconcile,
    ) {}

    public function handle(TrialReservation $reservation): string
    {
        abort_unless($this->gateway->ready(), 503, __('trials.payment_unavailable', [], 'fr'));

        return Cache::lock('trial-checkout:'.$reservation->id, 120)->block(5, function () use ($reservation): string {
            $reservation->refresh();
            if ($reservation->status !== TrialReservationStatus::Pending) {
                throw ValidationException::withMessages(['payment' => __('trials.processing', [], 'fr')]);
            }
            if ($reservation->expires_at->isPast()) {
                throw ValidationException::withMessages(['payment' => __('trials.expired', [], 'fr')]);
            }
            if ($reservation->checkout_url) {
                $status = $this->reconcile->handle($reservation, force: true)->status;
                if ($status !== TrialReservationStatus::Pending) {
                    throw ValidationException::withMessages(['payment' => match ($status) {
                        TrialReservationStatus::Confirmed => __('trials.already_paid', [], 'fr'),
                        TrialReservationStatus::Expired => __('trials.expired', [], 'fr'),
                        default => __('trials.processing', [], 'fr'),
                    }]);
                }

                return $reservation->checkout_url;
            }
            if ($reservation->expires_at->lt(now()->addMinutes(31))) {
                throw ValidationException::withMessages(['payment' => __('trials.expired', [], 'fr')]);
            }

            $claimed = TrialReservation::query()->whereKey($reservation->id)
                ->where('status', TrialReservationStatus::Pending)
                ->where('expires_at', '>', now())
                ->update(['checkout_started_at' => $reservation->checkout_started_at ?? now()]);
            if ($claimed !== 1) {
                throw ValidationException::withMessages(['payment' => __('trials.expired', [], 'fr')]);
            }
            $reservation->refresh();
            $checkout = $this->gateway->create($reservation);
            $url = $checkout->authorizationUrl;
            abort_unless(is_string($url) && str_starts_with($url, 'https://checkout.stripe.com/'), 502);
            TrialReservation::query()->whereKey($reservation->id)
                ->update(['stripe_session_id' => $checkout->accessCode, 'checkout_url' => $url]);

            return $url;
        });
    }
}
