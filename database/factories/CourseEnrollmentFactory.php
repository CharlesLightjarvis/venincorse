<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\CourseEnrollmentStatus;
use App\Enums\CoursePaymentPlan;
use App\Models\CourseCohort;
use App\Models\CourseEnrollment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CourseEnrollment>
 */
final class CourseEnrollmentFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'course_cohort_id' => CourseCohort::factory(),
            'status' => CourseEnrollmentStatus::Pending,
            'payment_plan' => CoursePaymentPlan::Full,
            'goal' => 'Parler allemand au travail',
            'timezone' => 'Europe/Paris',
            'amount_cents' => 72000,
            'currency' => 'EUR',
            'expires_at' => now()->addMinutes(45),
            'terms_accepted_at' => now(),
            'terms_version' => config('trials.terms_version'),
        ];
    }

    public function confirmed(): static
    {
        return $this->state(fn (): array => [
            'status' => CourseEnrollmentStatus::Confirmed,
            'paid_at' => now(),
            'stripe_session_id' => 'cs_test_'.fake()->unique()->bothify('????????'),
        ]);
    }
}
