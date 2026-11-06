<?php

use App\Enums\PermissionEnum;
use App\Http\Controllers\TrialAvailabilityController;
use App\Http\Controllers\TrialCheckoutController;
use App\Http\Controllers\TrialManagementController;
use App\Http\Controllers\TrialReservationController;
use App\Http\Middleware\ScopeIdempotencyKey;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'home/index')->name('home');

Route::inertia('courses', 'courses/index')->name('courses');

Route::inertia('courses/{slug}', 'courses/course-detail')->name('courses.show');

Route::inertia('exams', 'home/exams')->name('exams');

Route::inertia('workshops', 'home/workshops')->name('workshops');

Route::inertia('workshops/{slug}', 'workshops/workshop-detail')->name('workshops.show');

Route::inertia('manuels', 'textbooks/index')->name('textbooks');

Route::inertia('pricing', 'home/pricing')->name('pricing');

Route::inertia('level-test', 'level-test/index')->name('level-test');

Route::redirect('trial', '/trial-reservations/create')->name('trial');
Route::inertia('demo/trial', 'booking/index')->name('demo.trial');
Route::get('trial-reservations/create', [TrialReservationController::class, 'create'])->name('trial-reservations.create');

Route::middleware(['auth', 'verified'])->group(function (): void {
    Route::get('trial-reservations/prepare', [TrialReservationController::class, 'create'])
        ->middleware('can:'.PermissionEnum::ReserveTrial->value)->name('trial-reservations.prepare');
    Route::post('trial-reservations', [TrialReservationController::class, 'store'])
        ->middleware(['can:'.PermissionEnum::ReserveTrial->value, 'throttle:10,1', ScopeIdempotencyKey::class])->name('trial-reservations.store');
    Route::get('trial-reservations', [TrialReservationController::class, 'index'])
        ->middleware('can:'.PermissionEnum::ViewOwnTrials->value)->name('trial-reservations.index');
    Route::get('trial-reservations/{reservation}', [TrialReservationController::class, 'show'])
        ->middleware('can:view,reservation')->name('trial-reservations.show');
    Route::post('trial-reservations/{reservation}/checkout', [TrialCheckoutController::class, 'store'])
        ->middleware(['can:checkout,reservation', 'throttle:10,1', ScopeIdempotencyKey::class])->name('trial-checkout.store');
    Route::get('teaching/trial-reservations', [TrialManagementController::class, 'index'])
        ->middleware('can:'.PermissionEnum::ViewAllTrials->value)->name('trial-management.index');
    Route::patch('teaching/trial-reservations/{reservation}', [TrialManagementController::class, 'update'])
        ->middleware('can:update,reservation')->name('trial-management.update');
    Route::get('teaching/trial-availability', [TrialAvailabilityController::class, 'edit'])
        ->middleware('can:'.PermissionEnum::ManageAvailability->value)->name('trial-availability.edit');
    Route::put('teaching/trial-availability', [TrialAvailabilityController::class, 'update'])
        ->middleware('can:'.PermissionEnum::ManageAvailability->value)->name('trial-availability.update');
});

Route::inertia('booking/manage', 'booking/manage')->name('booking.manage');

Route::inertia('booking/teacher', 'booking/teacher')->name('booking.teacher');

Route::inertia('booking/course', 'booking/course')->name('booking.course');

Route::inertia('booking/course/manage', 'booking/course-manage')->name('booking.course-manage');

Route::inertia('booking/workshop', 'booking/workshop')->name('booking.workshop');

Route::inertia('booking/workshop/manage', 'booking/workshop-manage')->name('booking.workshop-manage');

Route::inertia('booking/exam', 'booking/exam')->name('booking.exam');

Route::inertia('booking/exam/manage', 'booking/exam-manage')->name('booking.exam-manage');

Route::inertia('about', 'home/about')->name('about');

Route::inertia('partenaires', 'home/partners')->name('partners');

Route::inertia('partenaires/demande', 'home/partner-request')->name('partners.request');

Route::inertia('contact', 'home/contact')->name('contact');

Route::inertia('blog', 'blog/index')->name('blog');
Route::inertia('blog/{slug}', 'blog/article')->name('blog.article');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [TrialReservationController::class, 'dashboard'])->name('dashboard');
});

require __DIR__.'/settings.php';
