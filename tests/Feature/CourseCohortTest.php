<?php

use App\Enums\CourseFormat;
use App\Enums\CourseRhythm;
use App\Models\CourseCohort;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    // Friday 20 March 2026; Paris moves to summer time on Sunday 29 March.
    $this->travelTo(Carbon::parse('2026-03-20 10:00:00', 'UTC'));
});

function courseManager(): User
{
    $user = User::factory()->create();
    $user->assignRole('administrator');

    return $user;
}

function cohortPayload(array $overrides = []): array
{
    return [
        'level' => 'b1', 'format' => 'group', 'rhythm' => 'intensif',
        'starts_on' => '2026-03-23', 'start_hour' => 9, 'capacity' => 6, 'skipped_dates' => [],
        ...$overrides,
    ];
}

test('only people allowed to manage courses can see or create groups', function () {
    $student = User::factory()->create();
    $student->assignRole('student');

    $this->get(route('course-cohorts.index'))->assertRedirect(route('login'));
    $this->actingAs($student)->get(route('course-cohorts.index'))->assertForbidden();
    $this->post(route('course-cohorts.store'), cohortPayload())->assertForbidden();

    $this->actingAs(courseManager())->get(route('course-cohorts.create'))
        ->assertInertia(fn (Assert $page) => $page->component('course-cohorts/create')->has('levels', 4)->has('rhythms', 4));
});

test('a new group lays out its 60 hours on the rhythm weekdays, in Paris time, with the catalog price', function () {
    $this->actingAs(courseManager())->post(route('course-cohorts.store'), cohortPayload([
        'skipped_dates' => ['2026-03-25'],
    ]))->assertSessionHasNoErrors();

    $cohort = CourseCohort::query()->with('sessions')->sole();
    $sessions = $cohort->sessions;

    expect($cohort)
        ->rhythm->toBe(CourseRhythm::Intensive)
        ->price_cents->toBe(84000)
        ->capacity->toBe(6)
        ->and($sessions)->toHaveCount(20)
        ->and($sessions->sum('duration_minutes'))->toBe(60 * 60)
        // Monday 23 March, 9:00 in Paris (UTC+1), then Tuesday; Wednesday 25 is skipped.
        ->and($sessions[0]->starts_at->format('Y-m-d H:i'))->toBe('2026-03-23 08:00')
        ->and($sessions[1]->starts_at->format('Y-m-d H:i'))->toBe('2026-03-24 08:00')
        ->and($sessions[2]->starts_at->format('Y-m-d H:i'))->toBe('2026-03-26 08:00')
        // After the switch to summer time, 9:00 in Paris is 07:00 UTC.
        ->and($sessions[4]->starts_at->format('Y-m-d H:i'))->toBe('2026-03-30 07:00')
        ->and($cohort->starts_at->equalTo($sessions[0]->starts_at))->toBeTrue()
        ->and($cohort->ends_at->equalTo($sessions->last()->endsAt()))->toBeTrue();
});

test('an extensive group of one-hour sessions and a one-on-one group with a single seat', function () {
    $this->actingAs(courseManager());

    $this->post(route('course-cohorts.store'), cohortPayload(['rhythm' => 'extensif', 'format' => 'solo', 'capacity' => 6]))
        ->assertSessionHasNoErrors();

    $cohort = CourseCohort::query()->withCount('sessions')->sole();
    expect($cohort)
        ->format->toBe(CourseFormat::Solo)
        ->capacity->toBe(1)
        ->price_cents->toBe(209000)
        ->sessions_count->toBe(60);
});

test('a group cannot start in the past, at an unusual hour or with more than six seats', function () {
    $this->actingAs(courseManager())
        ->post(route('course-cohorts.store'), cohortPayload(['starts_on' => '2026-03-20', 'start_hour' => 23, 'capacity' => 7]))
        ->assertInvalid(['starts_on', 'start_hour', 'capacity']);

    expect(CourseCohort::query()->count())->toBe(0);
});

test('the teacher updates the visio link, the seats and the opening of a group', function () {
    $cohort = CourseCohort::factory()->create();
    $this->actingAs(courseManager());

    $this->put(route('course-cohorts.update', $cohort), ['meeting_url' => 'http://insecure.example', 'capacity' => 4, 'is_published' => true])
        ->assertInvalid(['meeting_url']);
    $this->put(route('course-cohorts.update', $cohort), ['meeting_url' => 'https://meet.google.com/abc-defg-hij', 'capacity' => 4, 'is_published' => false])
        ->assertSessionHasNoErrors();

    expect($cohort->fresh())
        ->meeting_url->toBe('https://meet.google.com/abc-defg-hij')
        ->capacity->toBe(4)
        ->is_published->toBeFalse();

    $solo = CourseCohort::factory()->solo()->create();
    $this->put(route('course-cohorts.update', $solo), ['meeting_url' => null, 'capacity' => 2, 'is_published' => true])
        ->assertInvalid(['capacity']);
});

test('the teacher sees the groups and the full schedule of each one', function () {
    $this->actingAs(courseManager())->post(route('course-cohorts.store'), cohortPayload());
    $cohort = CourseCohort::query()->sole();

    $this->get(route('course-cohorts.index'))
        ->assertInertia(fn (Assert $page) => $page->component('course-cohorts/index')
            ->has('cohorts', 1)
            ->where('cohorts.0.level_label', 'B1 — S’exprimer')
            ->where('cohorts.0.seats_left', 6));
    $this->get(route('course-cohorts.show', $cohort))
        ->assertInertia(fn (Assert $page) => $page->component('course-cohorts/show')
            ->has('cohort.sessions', 20)
            ->where('cohort.sessions.0.duration_minutes', 180));
});

test('a group can be deleted with its schedule', function () {
    $this->actingAs(courseManager())->post(route('course-cohorts.store'), cohortPayload());
    $cohort = CourseCohort::query()->sole();

    $this->delete(route('course-cohorts.destroy', $cohort))->assertRedirect(route('course-cohorts.index'));

    expect(CourseCohort::query()->count())->toBe(0);
    $this->assertDatabaseCount('course_sessions', 0);
});
