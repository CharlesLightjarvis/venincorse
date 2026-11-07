<?php

declare(strict_types=1);

namespace App\Enums;

enum CourseInstallmentStatus: string
{
    case Scheduled = 'scheduled';
    /** The automatic charge failed; the student was asked to pay it themselves and it is retried. */
    case Failed = 'failed';
    case Paid = 'paid';
    /** Not due anymore: the enrollment was cancelled or refunded. */
    case Cancelled = 'cancelled';
}
