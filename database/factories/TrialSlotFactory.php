<?php

namespace Database\Factories;

use App\Models\TrialSlot;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TrialSlot>
 */
class TrialSlotFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'starts_at' => now()->addDays(3)->startOfHour()->addHours(fake()->unique()->numberBetween(0, 23)),
            'is_published' => true,
        ];
    }
}
