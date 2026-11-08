<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Enums\PermissionEnum;
use App\Models\CourseSession;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class CourseCohortResource extends JsonResource
{
    /** @param bool $showSessionMeetingUrls Exposes each session's own link (teacher, or enrolled student). */
    public function __construct(mixed $resource, private readonly bool $showSessionMeetingUrls = false)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        $isManager = $request->user()?->can(PermissionEnum::ManageCourses->value) ?? false;
        $showMeetingUrls = $this->showSessionMeetingUrls || $isManager;

        return [
            'id' => $this->id,
            'level' => $this->level->value,
            'level_label' => $this->level->label(),
            'format' => $this->format->value,
            'format_label' => $this->format->label(),
            'rhythm' => $this->rhythm->value,
            'rhythm_label' => $this->rhythm->label(),
            'weekdays' => $this->rhythm->weekdays(),
            'session_hours' => $this->rhythm->sessionHours(),
            'starts_at' => $this->starts_at->toIso8601String(),
            'ends_at' => $this->ends_at->toIso8601String(),
            'capacity' => $this->capacity,
            'seats_left' => $this->resource->seatsLeft(),
            'is_bookable' => $this->resource->isBookable(),
            'price_cents' => $this->price_cents,
            'currency' => $this->currency,
            'is_published' => $this->is_published,
            'has_started' => $this->resource->hasStarted(),
            'sessions_count' => $this->whenCounted('sessions'),
            'sessions' => $this->whenLoaded('sessions', fn (): array => $this->sessions->map(fn (CourseSession $session): array => [
                'id' => $session->id,
                'position' => $session->position,
                'starts_at' => $session->starts_at->toIso8601String(),
                'duration_minutes' => $session->duration_minutes,
                'meeting_url' => $showMeetingUrls ? $session->meeting_url : null,
            ])->all()),
            'meeting_url' => $this->when($isManager, $this->meeting_url),
        ];
    }
}
