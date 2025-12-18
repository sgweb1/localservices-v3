<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * ConversionResource - Format conversion funnel tracking
 */
class ConversionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'customer_id' => $this->customer_id,
            'provider_id' => $this->provider_id,
            'booking_id' => $this->booking_id,
            'funnel' => [
                'name' => $this->funnel_name,
                'stage' => $this->stage,
                'stage_name' => $this->stage_name,
                'completed' => $this->completed,
                'drop_reason' => $this->drop_reason,
            ],
            'timing' => [
                'reached_at' => $this->reached_at->toIso8601String(),
                'left_at' => $this->left_at?->toIso8601String(),
                'time_in_stage_seconds' => $this->time_in_stage_seconds,
            ],
            'interactions_count' => $this->interactions_count,
            'metadata' => $this->metadata,
        ];
    }
}
