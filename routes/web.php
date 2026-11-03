<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'home/index')->name('home');

Route::inertia('courses', 'courses/index')->name('courses');

Route::inertia('courses/{slug}', 'courses/course-detail')->name('courses.show');

Route::inertia('about', 'home/about')->name('about');

Route::inertia('contact', 'home/contact')->name('contact');

Route::inertia('blog', 'blog/index')->name('blog');
Route::inertia('blog/{slug}', 'blog/article')->name('blog.article');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
