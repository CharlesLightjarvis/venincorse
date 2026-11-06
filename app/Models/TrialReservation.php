<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\TrialReservationStatus;
use Database\Factories\TrialReservationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'trial_slot_id', 'submission_key', 'submission_hash', 'level', 'goal', 'timezone', 'amount_cents', 'currency', 'status', 'expires_at', 'checkout_started_at', 'stripe_session_id', 'checkout_url', 'paid_at', 'notes', 'meeting_url'])]
final class TrialReservation extends Model
{
    /** @use HasFactory<TrialReservationFactory> */
    use HasFactory, HasUuids;

    protected function casts(): array
    {
        return [
            'status' => TrialReservationStatus::class,
            'amount_cents' => 'integer',
            'expires_at' => 'immutable_datetime',
            'checkout_started_at' => 'immutable_datetime',
            'paid_at' => 'immutable_datetime',
        ];
    }

    public function slot(): BelongsTo
    {
        return $this->belongsTo(TrialSlot::class, 'trial_slot_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
