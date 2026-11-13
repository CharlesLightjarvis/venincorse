<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\RetryCourseInstallment;
use App\Http\Requests\RetryCourseInstallmentRequest;
use App\Models\CourseInstallment;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

final readonly class CourseInstallmentRetryController
{
    public function store(RetryCourseInstallmentRequest $request, CourseInstallment $installment, RetryCourseInstallment $retry): RedirectResponse
    {
        $retry->handle($installment);
        Inertia::flash('toast', ['type' => 'success', 'message' => __('courses.installment_retried', [], 'fr')]);

        return back();
    }
}
