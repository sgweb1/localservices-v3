<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Uproszczony Resource dla użytkownika
 */
class UserBasicResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'avatar_url' => $this->avatar_url,
            'rating_average' => (float) $this->rating_average,
            'rating_count' => $this->rating_count,
            'is_online' => $this->isOnline(),
            'last_seen_at' => $this->last_seen_at?->toIso8601String(),
        ];
    }
}
