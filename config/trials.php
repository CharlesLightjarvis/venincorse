<?php

declare(strict_types=1);

return [
    'amount_cents' => 3900,
    'currency' => 'EUR',
    'duration_minutes' => 60,
    'minimum_notice_hours' => 24,
    'hold_minutes' => 45,
    'reminder_hours' => 24,
    'change_notice_hours' => 24,
    'max_reschedules' => 1,
    'outcome_reminder_hours' => 12,
    'terms_version' => '2026-11-07',
    'timezone' => env('TRIAL_TIMEZONE', 'Europe/Paris'),
    'late_payment_cutoff_hours' => 12,
    'rebook_offer_days' => 14,
    'reminder_min_hours_after_payment' => 12,
    'window_days' => 14,
    'selectable_hours' => range(7, 20),
    'weekdays' => [1, 2, 3, 4, 5, 6],
    'hours' => [9, 11, 14, 16, 18],
    'test_mode_only' => (bool) env('TRIAL_TEST_MODE_ONLY', true),
    'public_url' => env('TRIAL_PUBLIC_URL'),
];
