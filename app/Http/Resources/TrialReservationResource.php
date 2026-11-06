<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Enums\PermissionEnum;
use App\Enums\TrialReservationStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class TrialReservationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'starts_at' => $this->slot->starts_at->toIso8601String(),
            'duration_minutes' => config('trials.duration_minutes'),
            'level' => $this->level, 'goal' => $this->goal, 'timezone' => $this->timezone,
            'status' => $this->status->value, 'amount_cents' => $this->amount_cents, 'currency' => $this->currency,
            'expires_at' => $this->expires_at->toIso8601String(),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'is_active' => $this->resource->isActive(),
            'has_started' => $this->resource->hasStarted(),
            'has_ended' => $this->resource->hasEnded(),
            'cancellation_reason' => $this->cancellation_reason,
            'cancelled_by' => $this->cancelled_by,
            'cancelled_at' => $this->cancelled_at?->toIso8601String(),
            'reschedule_count' => $this->reschedule_count,
            'change_deadline' => $this->resource->changeDeadline()->toIso8601String(),
            'session_summary' => $this->session_summary,
            'rebook_offered' => $this->rebook_offered_at !== null,
            'rebook_offer_expires_at' => $this->resource->rebookOfferExpiresAt()?->toIso8601String(),
            'is_rebooked' => $this->rebooked_at !== null,
            'actions' => $this->when($request->user()?->can(PermissionEnum::UpdateTrials->value), fn (): array => [
                'edit_meeting_link' => $this->resource->canReceiveMeetingLink(),
                'cancel' => $this->resource->isCancellable(),
                'record_outcome' => $this->resource->awaitsOutcome(),
                'resolve_review' => $this->status === TrialReservationStatus::PaymentReview,
                'confirm_review' => $this->status === TrialReservationStatus::PaymentReview
                    && $this->paid_at !== null && ! $this->resource->hasStarted(),
                'release_review' => $this->status === TrialReservationStatus::PaymentReview && $this->paid_at === null,
                'offer_rebook' => $this->resource->canReceiveRebookOffer(),
            ]),
            'student_actions' => $this->when($request->user()?->id === $this->user_id, fn (): array => [
                'reschedule' => $this->resource->canBeRescheduledByStudent(),
                'cancel' => $this->resource->canBeCancelledByStudent(),
                'rebook' => $this->resource->hasRebookOffer(),
            ]),
            'can_checkout' => $this->status === TrialReservationStatus::Pending && $this->expires_at->isFuture()
                && $request->user()?->can('checkout', $this->resource),
            'student' => $this->when($request->user()?->can(PermissionEnum::ViewAllTrials->value), fn (): array => [
                'name' => $this->user->name, 'email' => $this->user->email,
            ]),
            'notes' => $this->when($request->user()?->can(PermissionEnum::UpdateTrials->value), $this->notes ?? ''),
            'meeting_url' => $this->when(
                $request->user()?->can(PermissionEnum::UpdateTrials->value)
                    || ($request->user()?->id === $this->user_id
                        && $this->status === TrialReservationStatus::Confirmed && ! $this->resource->hasEnded()),
                $this->meeting_url,
            ),
        ];
    }
}
