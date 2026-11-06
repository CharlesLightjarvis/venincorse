<?php

namespace Database\Factories;

use App\Enums\TrialReservationStatus;
use App\Models\TrialReservation;
use App\Models\TrialSlot;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<TrialReservation>
 */
class TrialReservationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'trial_slot_id' => TrialSlot::factory(),
            'submission_key' => (string) Str::uuid(),
            'submission_hash' => hash('sha256', 'factory'),
            'level' => 'unknown',
            'goal' => 'Prepare a language learning plan',
            'timezone' => 'Europe/Paris',
            'amount_cents' => 3900,
            'currency' => 'EUR',
            'status' => TrialReservationStatus::Pending,
            'expires_at' => now()->addMinutes(45),
        ];
    }
}
