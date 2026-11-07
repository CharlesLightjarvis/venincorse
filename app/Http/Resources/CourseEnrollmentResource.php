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

        return [
            'id' => $this->id,
            'status' => $this->status->value,
            'payment_plan' => $this->payment_plan->value,
            'installments' => $this->whenLoaded('installments', fn (): array => $this->installments->map(fn (CourseInstallment $installment): array => [
                'id' => $installment->id,
                'position' => $installment->position,
                'amount_cents' => $installment->amount_cents,
                'status' => $installment->status->value,
                'due_at' => $installment->due_at->toIso8601String(),
                'paid_at' => $installment->paid_at?->toIso8601String(),
                'next_attempt_at' => $installment->next_attempt_at?->toIso8601String(),
                'can_pay' => $isOwner && $installment->isPayable(),
            ])->all()),
            'amount_cents' => $this->amount_cents,
            'currency' => $this->currency,
            'goal' => $this->goal,
            'created_at' => $this->created_at->toIso8601String(),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'expires_at' => $this->expires_at->toIso8601String(),
            'withdrawal_ends_at' => $this->resource->withdrawalEndsAt()->toIso8601String(),
            'can_pay' => $isOwner && $this->resource->isAwaitingPayment(),
            'cohort' => CourseCohortResource::make($cohort)->resolve($request),
            'meeting_url' => $this->when(
                $isManager || ($isOwner && $this->status === CourseEnrollmentStatus::Confirmed && $cohort->ends_at->isFuture()),
                $cohort->meeting_url,
            ),
            'student' => $this->when($isManager, fn (): array => ['name' => $this->user->name, 'email' => $this->user->email]),
            'notes' => $this->when($isManager, $this->notes ?? ''),
        ];
    }
}
