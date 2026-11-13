<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CancelCourseCohort;
use App\Http\Requests\CancelCourseCohortRequest;
use App\Models\CourseCohort;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

final readonly class CourseCohortCancellationController
{
    public function store(CancelCourseCohortRequest $request, CourseCohort $cohort, CancelCourseCohort $cancelCohort): RedirectResponse
    {
        $result = $cancelCohort->handle($cohort, $request->string('reason')->trim()->toString());

        if ($result['failed'] !== []) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('courses.cohort_cancelled_with_failures', [
                    'cancelled' => $result['cancelled'],
                    'failed' => count($result['failed']),
                ], 'fr'),
            ]);
        } else {
            Inertia::flash('toast', [
                'type' => 'success',
                'message' => __('courses.cohort_cancelled', [
                    'cancelled' => $result['cancelled'],
                    'released' => $result['released'],
                ], 'fr'),
            ]);
        }

        return back();
    }
}
