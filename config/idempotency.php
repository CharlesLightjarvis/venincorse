<?php

declare(strict_types=1);

return [
    'enabled' => true,
    'methods' => ['POST'],
    'ttl' => 1440,
    'cache_store' => env('IDEMPOTENCY_CACHE_STORE', 'database'),
    'lock_timeout' => 120,
    'lock_wait' => 5,
    'processing_ttl' => 5,
    'telemetry' => ['enabled' => false, 'driver' => 'null'],
    'alert' => ['threshold' => 60],
    'validation' => [
        'pattern' => '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i',
        'max_length' => 1048576,
    ],
];
