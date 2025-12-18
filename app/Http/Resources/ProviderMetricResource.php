<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * ProviderMetricResource - Format metryki providera dla API
 */
class ProviderMetricResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'provider_id' => $this->provider_id,
            'metric_date' => $this->metric_date->toDateString(),
            'bookings' => [
                'completed' => $this->bookings_completed,
                'cancelled' => $this->bookings_cancelled,
                'cancellation_rate' => $this->cancellation_rate,
            ],
            'response' => [
                'avg_time_minutes' => $this->avg_response_time_minutes,
            ],
            'reviews' => [
                'count' => $this->reviews_count,
                'avg_rating' => $this->avg_rating,
            ],
            'availability' => [
                'slots_available' => $this->slots_available,
                'slots_booked' => $this->slots_booked,
                'utilization_rate' => $this->utilization_rate,
            ],
            'revenue' => [
                'total' => $this->total_revenue,
                'currency' => 'PLN',
            ],
            'subscription_status' => $this->subscription_status,
        ];
    }
}
