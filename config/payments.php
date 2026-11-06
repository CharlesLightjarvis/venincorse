<?php

declare(strict_types=1);
use App\Services\TrialStripeDriver;

return [
    'default' => 'stripe',
    'fallback' => null,
    'providers' => [
        'paystack' => ['enabled' => false],
        'stripe' => [
            'enabled' => true,
            'driver' => 'stripe',
            'driver_class' => TrialStripeDriver::class,
            'secret_key' => env('STRIPE_SECRET_KEY'),
            'public_key' => env('STRIPE_PUBLIC_KEY'),
            'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
            'currencies' => ['EUR'],
        ],
    ],
    'health_check' => ['require_auth' => true],
    'logging' => ['enabled' => true, 'channel' => 'stack'],
    'trace' => ['record_http_bodies' => false],
    'webhook' => ['verify_signature' => true],
];
