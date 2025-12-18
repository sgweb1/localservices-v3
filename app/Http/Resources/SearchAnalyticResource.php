<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * SearchAnalyticResource - Format analytics wyszukiwań
 */
class SearchAnalyticResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'user_id' => $this->user_id,
            'search' => [
                'query' => $this->search_query,
                'category' => $this->service_category,
                'city' => $this->city,
            ],
            'results' => [
                'count' => $this->results_count,
                'clicked' => $this->results_clicked,
                'first_clicked' => $this->first_result_clicked,
            ],
            'conversion' => [
                'happened' => $this->conversion_happened,
                'time_to_booking_seconds' => $this->time_to_booking_seconds,
            ],
            'device' => $this->device,
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
