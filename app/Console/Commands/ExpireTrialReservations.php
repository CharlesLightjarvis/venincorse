<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Actions\ApplyTrialPayment;
use App\Actions\ReconcileTrialPayment;
use App\Enums\TrialReservationStatus;
use App\Models\TrialReservation;
use Illuminate\Console\Command;

final class ExpireTrialReservations extends Command
{
    protected $signature = 'trials:expire-reservations';

    protected $description = 'Release unpaid trial holds and reconcile unfinished payments with Stripe, even when a webhook was missed';

    public function handle(ApplyTrialPayment $applyPayment, ReconcileTrialPayment $reconcile): int
    {
        TrialReservation::query()
            ->whereIn('status', [TrialReservationStatus::Pending, TrialReservationStatus::Processing])
            ->where(fn ($query) => $query
                ->where('expires_at', '<', now())
                ->orWhere('checkout_started_at', '<', now()->subMinutes(5)))
            ->each(function (TrialReservation $reservation) use ($applyPayment, $reconcile): void {
                if ($reservation->checkout_started_at === null) {
                    $applyPayment->expireUnstarted($reservation);

                    return;
                }
                if ($reservation->stripe_session_id) {
                    $reconcile->handle($reservation, force: true);

                    return;
                }
                if ($reservation->expires_at->isPast()) {
                    TrialReservation::query()->whereKey($reservation->id)
                        ->whereNull('stripe_session_id')
                        ->where('status', TrialReservationStatus::Pending)
                        ->update(['status' => TrialReservationStatus::PaymentReview]);
                    $this->warn('Checkout outcome requires review: '.$reservation->id);
                }
            });

        return self::SUCCESS;
    }
}
