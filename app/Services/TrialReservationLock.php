<?php

declare(strict_types=1);

namespace App\Services;

use Closure;
use Illuminate\Support\Facades\Cache;

/**
 * Serializes the money operations of one reservation (payment, refund, cancellation, review), so a refund
 * and a status change can never interleave between a webhook, the scheduler and a person clicking.
 */
final readonly class TrialReservationLock
{
    /**
     * @template TResult
     *
     * @param  Closure(): TResult  $callback
     * @return TResult
     */
    public function run(string $reservationId, Closure $callback): mixed
    {
        return Cache::lock('trial-reservation:'.$reservationId, 60)->block(20, $callback);
    }
}
