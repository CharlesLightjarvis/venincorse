<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\TrialSlotFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['starts_at', 'is_published'])]
final class TrialSlot extends Model
{
    /** @use HasFactory<TrialSlotFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return ['starts_at' => 'immutable_datetime', 'is_published' => 'boolean'];
    }

    public function hold(): HasOne
    {
        return $this->hasOne(TrialSlotHold::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(TrialReservation::class);
    }
}
