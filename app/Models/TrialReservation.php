<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\TrialReservationStatus;
use Carbon\CarbonImmutable;
use Database\Factories\TrialReservationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'trial_slot_id', 'submission_key', 'submission_hash', 'level', 'goal', 'timezone', 'amount_cents', 'currency', 'status', 'expires_at', 'checkout_started_at', 'stripe_session_id', 'checkout_url', 'paid_at', 'notes', 'meeting_url', 'reminder_sent_at', 'cancelled_at', 'cancellation_reason', 'cancelled_by', 'reschedule_count', 'rebook_offered_at', 'rebooked_at', 'session_summary', 'outcome_reminder_sent_at', 'terms_accepted_at', 'terms_version'])]
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
            'reminder_sent_at' => 'immutable_datetime',
            'cancelled_at' => 'immutable_datetime',
            'reschedule_count' => 'integer',
            'rebook_offered_at' => 'immutable_datetime',
            'rebooked_at' => 'immutable_datetime',
            'outcome_reminder_sent_at' => 'immutable_datetime',
            'terms_accepted_at' => 'immutable_datetime',
        ];
    }

    /** The student may move or cancel a paid session until the change deadline (24 h before by default). */
    public function changeDeadline(): CarbonImmutable
    {
        return $this->slot->starts_at->subHours((int) config('trials.change_notice_hours'));
    }

    /**
     * A refunded cancellation until the change deadline. A session offered after a missed one stays unrefundable:
     * the missed session was not refunded and the new slot is a goodwill gesture.
     */
    public function canBeCancelledByStudent(): bool
    {
        return $this->status === TrialReservationStatus::Confirmed
            && $this->rebooked_at === null
            && $this->changeDeadline()->isFuture();
    }

    /**
     * Free rescheduling before the deadline (limited number of times), or the new slot the teacher offered after
     * a missed session. Choosing that offered slot counts as the student's change: it cannot be moved again.
     */
    public function canBeRescheduledByStudent(): bool
    {
        return ($this->canBeCancelledByStudent() && $this->reschedule_count < (int) config('trials.max_reschedules'))
            || $this->hasRebookOffer();
    }

    /** The teacher's offer of a new slot after a missed session, valid for a limited time. */
    public function hasRebookOffer(): bool
    {
        return $this->status === TrialReservationStatus::NoShow
            && $this->rebook_offered_at !== null
            && $this->rebookOfferExpiresAt()->isFuture();
    }

    public function rebookOfferExpiresAt(): ?CarbonImmutable
    {
        return $this->rebook_offered_at?->addDays((int) config('trials.rebook_offer_days'));
    }

    public function canReceiveRebookOffer(): bool
    {
        return $this->status === TrialReservationStatus::NoShow && $this->rebook_offered_at === null;
    }

    /** Whether the trial can still take place: being paid, paid and not yet held, or held while the student pays. */
    public function isActive(): bool
    {
        return in_array($this->status, [TrialReservationStatus::Processing, TrialReservationStatus::Confirmed, TrialReservationStatus::PaymentReview], true)
            || ($this->status === TrialReservationStatus::Pending && $this->expires_at->isFuture());
    }

    public function endsAt(): CarbonImmutable
    {
        return $this->slot->starts_at->addMinutes((int) config('trials.duration_minutes'));
    }

    public function hasStarted(): bool
    {
        return $this->slot->starts_at->isPast();
    }

    public function hasEnded(): bool
    {
        return $this->endsAt()->isPast();
    }

    /** The visio link only matters for a trial that will still take place. */
    public function canReceiveMeetingLink(): bool
    {
        return $this->isActive() && ! $this->hasEnded();
    }

    /** A paid session can be cancelled (and refunded) by the teacher until it starts. */
    public function isCancellable(): bool
    {
        return $this->status === TrialReservationStatus::Confirmed && ! $this->hasStarted();
    }

    /** Once a paid session has started (or is over), the teacher records whether it took place. */
    public function awaitsOutcome(): bool
    {
        return $this->status === TrialReservationStatus::Ended
            || ($this->status === TrialReservationStatus::Confirmed && $this->hasStarted());
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
