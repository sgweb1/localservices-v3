<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource dla usługi z danymi providera
 */
class ServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'title' => $this->title,
            'description' => $this->description,
            'base_price' => (float) $this->base_price,
            'category_id' => $this->category_id,
            'location_id' => $this->location_id,
            'instant_booking' => $this->instant_booking,
            'status' => $this->status,
            'provider' => [
                'id' => $this->provider_id,
                'uuid' => $this->provider?->uuid,
                'name' => $this->provider?->name,
                'avatar' => $this->provider?->avatar,
            ],
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
