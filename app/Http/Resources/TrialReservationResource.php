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
            'can_checkout' => $this->status === TrialReservationStatus::Pending && $this->expires_at->isFuture()
                && $request->user()?->can('checkout', $this->resource),
            'student' => $this->when($request->user()?->can(PermissionEnum::ViewAllTrials->value), fn (): array => [
                'name' => $this->user->name, 'email' => $this->user->email,
            ]),
            'notes' => $this->when($request->user()?->can(PermissionEnum::UpdateTrials->value), $this->notes ?? ''),
            'meeting_url' => $this->when(
                $request->user()?->can(PermissionEnum::UpdateTrials->value)
                    || ($request->user()?->id === $this->user_id && $this->status === TrialReservationStatus::Confirmed),
                $this->meeting_url,
            ),
        ];
    }
}
