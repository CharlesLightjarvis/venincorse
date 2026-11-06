<?php

declare(strict_types=1);

return [
    'amount_cents' => 3900,
    'currency' => 'EUR',
    'duration_minutes' => 60,
    'minimum_notice_hours' => 24,
    'hold_minutes' => 45,
    'timezone' => 'UTC',
    'weekdays' => [1, 2, 3, 4, 5, 6],
    'hours' => [9, 11, 14, 16, 18],
    'test_mode_only' => true,
    'public_url' => env('TRIAL_PUBLIC_URL'),
];
