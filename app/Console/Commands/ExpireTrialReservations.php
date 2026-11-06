<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Actions\ApplyTrialPayment;
use App\Actions\CreateTrialPaymentAlert;
use App\Actions\ReconcileTrialPayment;
use App\Enums\TrialReservationStatus;
use App\Models\TrialReservation;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

final class ExpireTrialReservations extends Command
{
    protected $signature = 'trials:expire-reservations';

    protected $description = 'Release unpaid trial holds and reconcile unfinished payments with Stripe, even when a webhook was missed';

    public function handle(ApplyTrialPayment $applyPayment, ReconcileTrialPayment $reconcile, CreateTrialPaymentAlert $alert): int
    {
        TrialReservation::query()
            ->whereIn('status', [TrialReservationStatus::Pending, TrialReservationStatus::Processing])
            ->where(fn ($query) => $query
                ->where('expires_at', '<', now())
                ->orWhere('checkout_started_at', '<', now()->subMinutes(5)))
            ->lazyById()
            ->each(function (TrialReservation $reservation) use ($applyPayment, $reconcile, $alert): void {
                if ($reservation->checkout_started_at === null) {
                    $applyPayment->expireUnstarted($reservation);

                    return;
                }
                if ($reservation->stripe_session_id) {
                    // Delayed bank payments can stay "processing" for days: ask Stripe every 15 minutes, not every minute.
                    if ($reservation->status === TrialReservationStatus::Processing
                        && ! Cache::add('trial-processing-check:'.$reservation->id, true, now()->addMinutes(15))) {
                        return;
                    }
                    $reconcile->handle($reservation, force: true);

                    return;
                }
                if ($reservation->expires_at->isPast()) {
                    $updated = TrialReservation::query()->whereKey($reservation->id)
                        ->whereNull('stripe_session_id')
                        ->where('status', TrialReservationStatus::Pending)
                        ->update(['status' => TrialReservationStatus::PaymentReview]);
                    if ($updated > 0) {
                        $alert->handle($reservation, 'l’élève a commencé à payer mais Stripe n’a jamais confirmé la session de paiement. Vérifie dans Stripe, puis libère le créneau si rien n’a été débité.');
                    }
                }
            });

        return self::SUCCESS;
    }
}
