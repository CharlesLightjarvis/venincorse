<?php

namespace Database\Factories;

use App\Models\CourseManual;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CourseManual>
 */
class CourseManualFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'level' => 'a1',
            'part' => 1,
            'type' => 'kursbuch',
            'path' => 'course-manuals/'.fake()->uuid().'.pdf',
            'original_name' => 'manuel.pdf',
            'size' => 1024,
        ];
    }
}
