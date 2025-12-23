<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource dla obszarów świadczenia usług providera.
 */
class ServiceAreaResource extends JsonResource
{
    /**
     * Transformuj model ServiceArea do tablicy dla API.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'latitude' => $this->latitude !== null ? (float) $this->latitude : null,
            'longitude' => $this->longitude !== null ? (float) $this->longitude : null,
            'radius_km' => $this->radius_km !== null ? (float) $this->radius_km : null,
            'travel_fee_per_km' => $this->travel_fee_per_km !== null ? (float) $this->travel_fee_per_km : null,
            'min_travel_fee' => $this->min_travel_fee !== null ? (float) $this->min_travel_fee : null,
            'is_active' => (bool) $this->is_active,
            'location_id' => $this->location_id,
        ];
    }
}
