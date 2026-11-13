<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\CourseEnrollmentStatus;
use App\Enums\CourseLevel;
use App\Models\CourseEnrollment;
use App\Models\CourseManual;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

final class CourseManualController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('course-manuals/index', [
            'manuals' => CourseManual::query()->orderBy('level')->orderBy('part')->orderBy('type')->get(['id', 'level', 'part', 'type', 'original_name', 'size', 'updated_at']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'level' => ['required', Rule::enum(CourseLevel::class)],
            'part' => ['required', 'integer', Rule::in([1, 2])],
            'type' => ['required', Rule::in(['kursbuch', 'arbeitsbuch'])],
            'file' => ['required', 'file', 'mimes:pdf', 'max:102400'],
        ]);

        $file = $request->file('file');
        $path = $file->store('course-manuals', 'local');
        abort_if($path === false, 500, 'Impossible de sauvegarder le fichier.');

        try {
            $manual = CourseManual::query()->firstOrNew(['level' => $data['level'], 'part' => $data['part'], 'type' => $data['type']]);
            $oldPath = $manual->exists ? $manual->path : null;
            $manual->fill(['path' => $path, 'original_name' => $file->getClientOriginalName(), 'size' => $file->getSize()]);
            $manual->save();
        } catch (Throwable $exception) {
            Storage::disk('local')->delete($path);
            throw $exception;
        }

        if ($oldPath !== null && $oldPath !== $path) {
            Storage::disk('local')->delete($oldPath);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Le manuel a été enregistré.']);

        return back();
    }

    public function show(Request $request, CourseEnrollment $enrollment, CourseManual $manual): StreamedResponse
    {
        $cohort = $enrollment->cohort;
        abort_unless(
            $enrollment->user_id === $request->user()->id
            && $enrollment->status === CourseEnrollmentStatus::Confirmed
            && $cohort->cancelled_at === null
            && $manual->level === $cohort->level
            && ($manual->part === 1 || ($manual->part === 2 && $cohort->second_manuals_visible))
            && Storage::disk('local')->exists($manual->path),
            404,
        );

        return Storage::disk('local')->response($manual->path, 'manuel.pdf', [
            'Content-Type' => 'application/pdf',
            'X-Content-Type-Options' => 'nosniff',
            'Content-Security-Policy' => "default-src 'none'; frame-ancestors 'self'",
            'X-Frame-Options' => 'SAMEORIGIN',
            'Referrer-Policy' => 'no-referrer',
            'Cross-Origin-Resource-Policy' => 'same-origin',
            'Cache-Control' => 'private, no-store',
        ], 'inline');
    }
}
