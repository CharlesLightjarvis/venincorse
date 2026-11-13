<?php

use App\Enums\PermissionEnum;
use App\Http\Controllers\CourseCatalogController;
use App\Http\Controllers\CourseCohortCancellationController;
use App\Http\Controllers\CourseCohortController;
use App\Http\Controllers\CourseCohortScheduleController;
use App\Http\Controllers\CourseEnrollmentCancellationController;
use App\Http\Controllers\CourseEnrollmentController;
use App\Http\Controllers\CourseEnrollmentManagementController;
use App\Http\Controllers\CourseInstallmentCheckoutController;
use App\Http\Controllers\CourseInstallmentRetryController;
use App\Http\Controllers\CourseManualController;
use App\Http\Controllers\CourseManualVisibilityController;
use App\Http\Controllers\CourseSessionAttendanceController;
use App\Http\Controllers\CourseSessionController;
use App\Http\Controllers\ManualCourseEnrollmentController;
use App\Http\Controllers\TrialAvailabilityController;
use App\Http\Controllers\TrialCancellationController;
use App\Http\Controllers\TrialCheckoutController;
use App\Http\Controllers\TrialManagementController;
use App\Http\Controllers\TrialOutcomeController;
use App\Http\Controllers\TrialPaymentReviewController;
use App\Http\Controllers\TrialRebookOfferController;
use App\Http\Controllers\TrialRescheduleController;
use App\Http\Controllers\TrialReservationController;
use App\Http\Controllers\TrialStudentCancellationController;
use App\Http\Middleware\ScopeIdempotencyKey;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'home/index')->name('home');

Route::inertia('courses', 'courses/index')->name('courses');

Route::get('courses/{slug}', [CourseCatalogController::class, 'show'])->name('courses.show');

Route::inertia('exams', 'home/exams')->name('exams');

Route::inertia('workshops', 'home/workshops')->name('workshops');

Route::inertia('workshops/{slug}', 'workshops/workshop-detail')->name('workshops.show');

Route::inertia('manuels', 'textbooks/index')->name('textbooks');

Route::inertia('pricing', 'home/pricing')->name('pricing');

Route::inertia('level-test', 'level-test/index')->name('level-test');

Route::redirect('trial', '/trial-reservations/create')->name('trial');
Route::inertia('demo/trial', 'booking/index')->name('demo.trial');
Route::get('trial-reservations/create', [TrialReservationController::class, 'create'])->middleware('throttle:60,1')->name('trial-reservations.create');

Route::get('course-enrollments/create', [CourseEnrollmentController::class, 'create'])->middleware('throttle:60,1')->name('course-enrollments.create');

Route::middleware(['auth', 'verified'])->group(function (): void {
    Route::get('course-enrollments/prepare', [CourseEnrollmentController::class, 'create'])
        ->middleware(['can:'.PermissionEnum::EnrollInCourses->value, 'throttle:60,1'])->name('course-enrollments.prepare');
    Route::post('course-enrollments', [CourseEnrollmentController::class, 'store'])
        ->middleware(['can:'.PermissionEnum::EnrollInCourses->value, 'throttle:10,1'])->name('course-enrollments.store');
    Route::get('course-enrollments', [CourseEnrollmentController::class, 'index'])
        ->middleware(['can:'.PermissionEnum::ViewOwnCourses->value, 'throttle:60,1'])->name('course-enrollments.index');
    Route::get('course-enrollments/{enrollment}', [CourseEnrollmentController::class, 'show'])
        ->middleware(['can:'.PermissionEnum::ViewOwnCourses->value, 'throttle:60,1'])->name('course-enrollments.show');
    Route::get('course-enrollments/{enrollment}/manuals/{manual}', [CourseManualController::class, 'show'])
        ->middleware(['can:'.PermissionEnum::ViewOwnCourses->value, 'throttle:60,1'])->name('course-manuals.show');
    Route::post('course-enrollments/{enrollment}/checkout', [CourseEnrollmentController::class, 'checkout'])
        ->middleware(['can:'.PermissionEnum::EnrollInCourses->value, 'throttle:10,1'])->name('course-enrollments.checkout');
    Route::post('course-installments/{installment}/checkout', [CourseInstallmentCheckoutController::class, 'store'])
        ->middleware(['can:'.PermissionEnum::ViewOwnCourses->value, 'throttle:10,1'])->name('course-installments.checkout');
    Route::get('trial-reservations/prepare', [TrialReservationController::class, 'create'])
        ->middleware(['can:'.PermissionEnum::ReserveTrial->value, 'throttle:60,1'])->name('trial-reservations.prepare');
    Route::post('trial-reservations', [TrialReservationController::class, 'store'])
        ->middleware(['can:'.PermissionEnum::ReserveTrial->value, 'throttle:10,1', ScopeIdempotencyKey::class])->name('trial-reservations.store');
    Route::get('trial-reservations', [TrialReservationController::class, 'index'])
        ->middleware(['can:'.PermissionEnum::ViewOwnTrials->value, 'throttle:60,1'])->name('trial-reservations.index');
    Route::get('trial-reservations/{reservation}/reschedule', [TrialRescheduleController::class, 'create'])
        ->name('trial-reschedules.create');
    Route::post('trial-reservations/{reservation}/reschedule', [TrialRescheduleController::class, 'store'])
        ->middleware('throttle:10,1')->name('trial-reschedules.store');
    Route::post('trial-reservations/{reservation}/cancellation', [TrialStudentCancellationController::class, 'store'])
        ->middleware('throttle:10,1')->name('trial-student-cancellations.store');
    Route::post('trial-reservations/{reservation}/checkout', [TrialCheckoutController::class, 'store'])
        ->middleware(['can:checkout,reservation', 'throttle:10,1', ScopeIdempotencyKey::class])->name('trial-checkout.store');
    Route::get('teaching/trial-reservations', [TrialManagementController::class, 'index'])
        ->middleware('can:'.PermissionEnum::ViewAllTrials->value)->name('trial-management.index');
    Route::get('teaching/trial-reservations/{reservation}', [TrialManagementController::class, 'show'])
        ->middleware('can:'.PermissionEnum::ViewAllTrials->value)->name('trial-management.show');
    Route::patch('teaching/trial-reservations/{reservation}', [TrialManagementController::class, 'update'])
        ->middleware('can:update,reservation')->name('trial-management.update');
    Route::post('teaching/trial-reservations/{reservation}/cancellation', [TrialCancellationController::class, 'store'])
        ->middleware(['can:update,reservation', 'throttle:10,1'])->name('trial-cancellations.store');
    Route::put('teaching/trial-reservations/{reservation}/outcome', [TrialOutcomeController::class, 'update'])
        ->middleware('can:update,reservation')->name('trial-outcomes.update');
    Route::post('teaching/trial-reservations/{reservation}/rebook-offer', [TrialRebookOfferController::class, 'store'])
        ->middleware('can:update,reservation')->name('trial-rebook-offers.store');
    Route::put('teaching/trial-reservations/{reservation}/payment-review', [TrialPaymentReviewController::class, 'update'])
        ->middleware(['can:update,reservation', 'throttle:10,1'])->name('trial-payment-reviews.update');
    Route::prefix('teaching')->middleware('can:'.PermissionEnum::ManageCourses->value)->group(function (): void {
        Route::get('course-manuals', [CourseManualController::class, 'index'])->name('course-manual-management.index');
        Route::post('course-manuals', [CourseManualController::class, 'store'])->middleware('throttle:20,1')->name('course-manual-management.store');
        Route::put('course-cohorts/{cohort}/manual-visibility', [CourseManualVisibilityController::class, 'update'])->name('course-manual-visibility.update');
        Route::resource('course-cohorts', CourseCohortController::class)
            ->parameters(['course-cohorts' => 'cohort'])
            ->except(['edit']);
        Route::put('course-sessions/{session}', [CourseSessionController::class, 'update'])
            ->name('course-sessions.update');
        Route::put('course-sessions/{session}/attendance', [CourseSessionAttendanceController::class, 'update'])
            ->name('course-sessions.attendance.update');
        Route::put('course-cohorts/{cohort}/schedule', [CourseCohortScheduleController::class, 'update'])
            ->name('course-cohort-schedules.update');
        Route::post('course-cohorts/{cohort}/cancellation', [CourseCohortCancellationController::class, 'store'])
            ->middleware('throttle:10,1')->name('course-cohort-cancellations.store');
        Route::post('course-installments/{installment}/retry', [CourseInstallmentRetryController::class, 'store'])
            ->middleware('throttle:10,1')->name('course-installments.retry');
        Route::get('course-enrollments', [CourseEnrollmentManagementController::class, 'index'])
            ->name('course-enrollment-management.index');
        Route::post('course-enrollments', [ManualCourseEnrollmentController::class, 'store'])
            ->middleware('throttle:30,1')->name('manual-course-enrollments.store');
        Route::patch('course-enrollments/{enrollment}', [CourseEnrollmentManagementController::class, 'update'])
            ->name('course-enrollment-management.update');
        Route::post('course-enrollments/{enrollment}/cancellation', [CourseEnrollmentCancellationController::class, 'store'])
            ->middleware('throttle:10,1')->name('course-enrollment-cancellations.store');
    });
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

Route::inertia('mentions-legales', 'home/legal/notice')->name('legal.notice');
Route::inertia('cgu', 'home/legal/terms')->name('legal.terms');
Route::inertia('cgv', 'home/legal/sales')->name('legal.sales');
Route::inertia('confidentialite', 'home/legal/privacy')->name('legal.privacy');

Route::inertia('blog', 'blog/index')->name('blog');
Route::inertia('blog/{slug}', 'blog/article')->name('blog.article');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [TrialReservationController::class, 'dashboard'])->middleware('throttle:60,1')->name('dashboard');
});

require __DIR__.'/settings.php';
