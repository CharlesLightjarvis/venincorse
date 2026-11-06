<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['trial_slot_id', 'trial_reservation_id'])]
final class TrialSlotHold extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'trial_slot_id';

    public $incrementing = false;
}
