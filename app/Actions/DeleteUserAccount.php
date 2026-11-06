<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\TrialReservation;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Deletes an account. A student who already booked a trial keeps an anonymised record instead, because paid
 * reservations must stay in the accounts: the name, email and login data are erased and access is revoked.
 */
final readonly class DeleteUserAccount
{
    public function handle(User $user): void
    {
        DB::transaction(function () use ($user): void {
            if (! TrialReservation::query()->where('user_id', $user->id)->exists()) {
                $user->delete();

                return;
            }
            TrialReservation::query()->where('user_id', $user->id)->update(['goal' => '—', 'meeting_url' => null]);
            $user->passkeys()->delete();
            $user->syncRoles([]);
            $user->syncPermissions([]);
            $user->forceFill([
                'name' => 'Compte supprimé',
                'email' => 'deleted-'.$user->id.'@deleted.invalid',
                'password' => Hash::make(Str::random(64)),
                'remember_token' => null,
                'email_verified_at' => null,
                'two_factor_secret' => null,
                'two_factor_recovery_codes' => null,
                'two_factor_confirmed_at' => null,
                'timezone' => null,
            ])->save();
        });
    }
}
