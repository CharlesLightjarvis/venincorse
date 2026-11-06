<?php

declare(strict_types=1);

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;
use Laravel\Fortify\Fortify;
use Symfony\Component\HttpFoundation\Response;

final class RegisterResponse implements RegisterResponseContract
{
    public function toResponse($request): Response
    {
        return $request->wantsJson()
            ? response()->json([], 201)
            : redirect()->intended(Fortify::redirects('register'));
    }
}
