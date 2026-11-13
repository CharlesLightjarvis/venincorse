<?php

namespace App\Models;

use App\Enums\CourseLevel;
use Database\Factories\CourseManualFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['level', 'part', 'type', 'path', 'original_name', 'size'])]
final class CourseManual extends Model
{
    /** @use HasFactory<CourseManualFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return ['level' => CourseLevel::class, 'part' => 'integer', 'size' => 'integer'];
    }
}
