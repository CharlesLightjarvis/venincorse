<?php

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

Route::inertia('trial', 'booking/index')->name('trial');

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
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
