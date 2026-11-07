<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateCourseInstallmentCheckout;
use App\Models\CourseInstallment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

final readonly class CourseInstallmentCheckoutController
{
    /** The student settles one of their own due instalments on a Stripe payment page. */
    public function store(Request $request, CourseInstallment $installment, CreateCourseInstallmentCheckout $createCheckout): Response
    {
        abort_unless($installment->enrollment()->where('user_id', $request->user()->id)->exists(), 404);

        return Inertia::location($createCheckout->handle($installment));
    }
}
