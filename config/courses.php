<?php

declare(strict_types=1);

/*
| Course enrollment ("parcours"): one full CEFR level of 60 hours, taught to a group or one-on-one.
| Prices are per person and copied onto each cohort when it is created, so a later change here never
| alters what already-booked students pay. Weekdays use ISO numbers (1 = Monday … 7 = Sunday) and,
| like the session hours, are read in the school's time zone (`trials.timezone`).
*/

return [
    'currency' => 'EUR',
    'total_hours' => 60,
    'hold_minutes' => 45,
    'withdrawal_days' => 14,
    'installments' => [
        'count' => 3,
        'surcharge_percent' => 5,
        'interval_days' => 30,
    ],
    'capacity' => [
        'group' => 6,
        'solo' => 1,
    ],
    'session_start_hours' => range(7, 20),
    'levels' => [
        'a1' => ['title' => 'Les fondations', 'group_cents' => 72000, 'solo_cents' => 209000],
        'a2' => ['title' => 'Raconter', 'group_cents' => 72000, 'solo_cents' => 209000],
        'b1' => ['title' => 'S’exprimer', 'group_cents' => 84000, 'solo_cents' => 209000],
        'b2' => ['title' => 'Structurer', 'group_cents' => 90000, 'solo_cents' => 209000],
    ],
    'rhythms' => [
        'extensif' => ['weekdays' => [1, 3, 5], 'session_hours' => 1],
        'accelere' => ['weekdays' => [2, 4], 'session_hours' => 3],
        'intensif' => ['weekdays' => [1, 2, 3, 4, 5], 'session_hours' => 3],
        'super-intensif' => ['weekdays' => [1, 2, 3, 4, 5], 'session_hours' => 5],
    ],
];
