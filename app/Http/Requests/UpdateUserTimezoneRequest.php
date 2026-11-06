<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateUserTimezoneRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return ['timezone' => ['present', 'nullable', 'string', 'timezone:all_with_bc']];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return ['timezone.*' => 'Choisis un fuseau horaire valide ou laisse le champ vide pour utiliser celui du navigateur.'];
    }

    public function timezone(): ?string
    {
        return $this->filled('timezone') ? $this->string('timezone')->value() : null;
    }
}
