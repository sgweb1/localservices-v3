<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource dla rezerwacji
 */
class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'booking_number' => $this->booking_number,
            'status' => $this->status,
            'booking_date' => $this->booking_date?->format('Y-m-d'),
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'duration_minutes' => $this->duration_minutes,
            'service_address' => $this->service_address,
            'distance_km' => (float) $this->distance_km,
            'total_price' => (float) $this->total_price,
            'currency' => $this->currency,
            'payment_status' => $this->payment_status,
            'service' => new ServiceResource($this->whenLoaded('service')),
            'customer' => new UserBasicResource($this->whenLoaded('customer')),
            'provider' => new UserBasicResource($this->whenLoaded('provider')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
