<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\PermissionEnum;
use Illuminate\Foundation\Http\FormRequest;

final class RetryCourseInstallmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(PermissionEnum::ManageCourses->value) ?? false;
    }

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [];
    }
}
