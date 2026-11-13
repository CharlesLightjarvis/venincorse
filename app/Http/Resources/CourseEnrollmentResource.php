<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Enums\CourseEnrollmentStatus;
use App\Enums\PermissionEnum;
use App\Models\CourseInstallment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class CourseEnrollmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isOwner = $request->user()?->id === $this->user_id;
        $isManager = $request->user()?->can(PermissionEnum::ManageCourses->value) ?? false;
        $cohort = $this->cohort;
        $canSeeMeetingLinks = $isManager || ($isOwner && $this->status === CourseEnrollmentStatus::Confirmed && $cohort->ends_at->isFuture());

        return [
            'id' => $this->id,
            'status' => $this->status->value,
            'payment_plan' => $this->payment_plan->value,
            'payment_method' => $this->payment_method?->value ?? 'stripe',
            'payment_reference' => $this->when($isManager, $this->payment_reference),
            'installments' => $this->whenLoaded('installments', fn (): array => $this->installments->map(fn (CourseInstallment $installment): array => [
                'id' => $installment->id,
                'position' => $installment->position,
                'amount_cents' => $installment->amount_cents,
                'status' => $installment->status->value,
                'due_at' => $installment->due_at->toIso8601String(),
                'paid_at' => $installment->paid_at?->toIso8601String(),
                'next_attempt_at' => $installment->next_attempt_at?->toIso8601String(),
                'failure_message' => $installment->failure_message,
                'can_pay' => $isOwner && $installment->isPayable(),
                'can_retry' => $isManager && $this->status === CourseEnrollmentStatus::Confirmed && $installment->isPayable(),
            ])->all()),
            'amount_cents' => $this->amount_cents,
            'currency' => $this->currency,
            'goal' => $this->goal,
            'created_at' => $this->created_at->toIso8601String(),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'expires_at' => $this->expires_at->toIso8601String(),
            'withdrawal_ends_at' => $this->resource->withdrawalEndsAt()->toIso8601String(),
            'can_pay' => $isOwner && $this->resource->isAwaitingPayment(),
            'cohort' => new CourseCohortResource($cohort, $canSeeMeetingLinks)->resolve($request),
            'meeting_url' => $this->when($canSeeMeetingLinks, $cohort->meeting_url),
            'refunded_cents' => $this->refunded_cents,
            'cancellation_reason' => $this->cancellation_reason,
            'cancelled_at' => $this->cancelled_at?->toIso8601String(),
            'management' => $this->when($isManager, fn (): array => $this->management()),
            'attendances' => $this->whenLoaded('attendances', fn (): array => $this->attendances->map(fn ($attendance): array => [
                'session_id' => $attendance->course_session_id,
                'status' => $attendance->status->value,
                'session' => $attendance->relationLoaded('session') && $attendance->session !== null
                    ? [
                        'position' => $attendance->session->position,
                        'starts_at' => $attendance->session->starts_at->toIso8601String(),
                        'cancelled_at' => $attendance->session->cancelled_at?->toIso8601String(),
                    ]
                    : null,
            ])->all()),
            'student' => $this->when($isManager, fn (): array => ['name' => $this->user->name, 'email' => $this->user->email]),
            'notes' => $this->when($isManager, $this->notes ?? ''),
        ];
    }

    /**
     * What the teacher needs to cancel fairly: on a withdrawal after the course started, the student owes the part
     * already followed (Code de la consommation, art. L221-25), so the suggested refund is what they paid beyond it.
     *
     * @return array{paid_cents: int, refundable_cents: int, prorata_refund_cents: int, hours_done: float, can_cancel: bool, withdrawal_open: bool}
     */
    private function management(): array
    {
        $paid = $this->resource->paidCents();
        $refundable = max(0, $paid - $this->refunded_cents);
        $minutesDone = $this->cohort->relationLoaded('sessions')
            ? (int) $this->cohort->sessions->filter(fn ($session): bool => $session->starts_at->lte(now()))->sum('duration_minutes')
            : (int) $this->cohort->sessions()->where('starts_at', '<=', now())->sum('duration_minutes');
        $totalMinutes = (int) config('courses.total_hours') * 60;
        $owed = (int) round($this->amount_cents * min(1, $minutesDone / $totalMinutes));

        return [
            'paid_cents' => $paid,
            'refundable_cents' => $refundable,
            'prorata_refund_cents' => max(0, min($refundable, $paid - $owed)),
            'hours_done' => round($minutesDone / 60, 1),
            'can_cancel' => $this->resource->isCancellable(),
            'withdrawal_open' => $this->resource->withdrawalEndsAt()->isFuture(),
        ];
    }
}
