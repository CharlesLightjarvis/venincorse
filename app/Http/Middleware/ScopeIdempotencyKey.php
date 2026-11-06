<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Infinitypaul\Idempotency\Middleware\EnsureIdempotency;
use Ramsey\Uuid\Uuid;
use Symfony\Component\HttpFoundation\Response;

final readonly class ScopeIdempotencyKey
{
    public function __construct(private EnsureIdempotency $idempotency) {}

    public function handle(Request $request, Closure $next): Response
    {
        $key = $request->header('Idempotency-Key');
        abort_unless(is_string($key) && Str::isUuid($key), 400, __('trials.key_required', [], 'fr'));
        $request->attributes->set('submission_key', $key);
        $scope = $request->user()->getAuthIdentifier().'|'.$request->method().'|'.$request->path().'|'.$key;
        $scopedKey = Uuid::uuid5(Uuid::NAMESPACE_URL, $scope)->toString();
        $request->headers->set('Idempotency-Key', $scopedKey);

        $response = $this->idempotency->handle($request, $next);
        /** The package caches every response, including recoverable validation and gateway failures. */
        if ($response->getStatusCode() === 422 || $response->getStatusCode() >= 500) {
            $cache = Cache::store(config('idempotency.cache_store'));
            foreach (['response', 'metadata', 'payload_hash'] as $suffix) {
                $cache->forget('idempotency:'.$scopedKey.':'.$suffix);
            }
        }
        $response->headers->set('Idempotency-Key', $key);

        return $response;
    }
}
