<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\UpdateUserTimezone;
use App\Http\Requests\UpdateUserTimezoneRequest;
use Illuminate\Http\RedirectResponse;

final readonly class UserTimezoneController
{
    public function update(UpdateUserTimezoneRequest $request, UpdateUserTimezone $action): RedirectResponse
    {
        $action->handle($request->user(), $request->timezone());

        return back();
    }
}
