<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\CourseCohort;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

final class CourseManualVisibilityController extends Controller
{
    public function update(Request $request, CourseCohort $cohort): RedirectResponse
    {
        $data = $request->validate(['visible' => ['required', 'boolean']]);
        $cohort->second_manuals_visible = $data['visible'];
        $cohort->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'La visibilité des manuels a été mise à jour.']);

        return back();
    }
}
