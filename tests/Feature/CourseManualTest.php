<?php

use App\Enums\CourseEnrollmentStatus;
use App\Models\CourseCohort;
use App\Models\CourseEnrollment;
use App\Models\CourseManual;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    Storage::fake('local');
    $this->admin = User::factory()->create();
    $this->admin->assignRole('administrator');
    $this->student = User::factory()->create();
    $this->student->assignRole('student');
});

test('managers upload and replace a private PDF for a level and part', function () {
    $this->actingAs($this->admin)->post(route('course-manual-management.store'), [
        'level' => 'a1', 'part' => 1, 'type' => 'kursbuch',
        'file' => UploadedFile::fake()->create('premier.pdf', 10, 'application/pdf'),
    ])->assertSessionHasNoErrors();

    $manual = CourseManual::query()->sole();
    $oldPath = $manual->path;
    Storage::disk('local')->assertExists($oldPath);

    $this->post(route('course-manual-management.store'), [
        'level' => 'a1', 'part' => 1, 'type' => 'kursbuch',
        'file' => UploadedFile::fake()->create('nouveau.pdf', 10, 'application/pdf'),
    ])->assertSessionHasNoErrors();

    expect(CourseManual::query()->count())->toBe(1)
        ->and($manual->fresh()->original_name)->toBe('nouveau.pdf');
    Storage::disk('local')->assertMissing($oldPath);
    Storage::disk('local')->assertExists($manual->fresh()->path);
});

test('uploads and group visibility are restricted and validated', function () {
    $cohort = CourseCohort::factory()->create();
    $this->actingAs($this->student)->post(route('course-manual-management.store'))->assertForbidden();
    $this->put(route('course-manual-visibility.update', $cohort), ['visible' => true])->assertForbidden();
    $this->actingAs($this->admin)->post(route('course-manual-management.store'), [
        'level' => 'a1', 'part' => 1, 'type' => 'kursbuch',
        'file' => UploadedFile::fake()->create('image.jpg', 10, 'image/jpeg'),
    ])->assertInvalid(['file']);
    $this->put(route('course-manual-visibility.update', $cohort), ['visible' => true])->assertSessionHasNoErrors();
    expect($cohort->fresh()->second_manuals_visible)->toBeTrue();
});

test('manual access requires the owner confirmed enrollment, matching level and group visibility', function () {
    $cohort = CourseCohort::factory()->create(['level' => 'a1', 'second_manuals_visible' => false]);
    $enrollment = CourseEnrollment::factory()->confirmed()->create(['user_id' => $this->student->id, 'course_cohort_id' => $cohort->id]);
    $first = CourseManual::factory()->create(['level' => 'a1', 'part' => 1]);
    $second = CourseManual::factory()->create(['level' => 'a1', 'part' => 2]);
    $otherLevel = CourseManual::factory()->create(['level' => 'b1', 'part' => 1]);
    foreach ([$first, $second, $otherLevel] as $manual) {
        Storage::disk('local')->put($manual->path, '%PDF-1.4 test');
    }

    $this->actingAs($this->student)->get(route('course-manuals.show', [$enrollment, $first]))
        ->assertOk()
        ->assertHeader('Content-Type', 'application/pdf')
        ->assertHeader('X-Content-Type-Options', 'nosniff')
        ->assertHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'self'")
        ->assertHeader('X-Frame-Options', 'SAMEORIGIN')
        ->assertHeader('Cross-Origin-Resource-Policy', 'same-origin');
    $this->get(route('course-manuals.show', [$enrollment, $second]))->assertNotFound();
    $this->get(route('course-manuals.show', [$enrollment, $otherLevel]))->assertNotFound();
    $this->get(route('course-enrollments.show', $enrollment))->assertInertia(fn (Assert $page) => $page->has('manuals', 1)->where('manuals.0.id', $first->id));

    $cohort->second_manuals_visible = true;
    $cohort->save();
    $this->get(route('course-manuals.show', [$enrollment, $second]))->assertOk();
    $this->get(route('course-enrollments.show', $enrollment))->assertInertia(fn (Assert $page) => $page->has('manuals', 2));
    $enrollment->update(['status' => CourseEnrollmentStatus::Cancelled]);
    $this->get(route('course-manuals.show', [$enrollment, $first]))->assertNotFound();

    $other = User::factory()->create();
    $other->assignRole('student');
    $this->actingAs($other)->get(route('course-manuals.show', [$enrollment, $first]))->assertNotFound();
});
