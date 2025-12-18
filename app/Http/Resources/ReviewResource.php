<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource dla recenzji
 */
class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'rating' => $this->rating,
            'categories' => $this->categories,
            'comment' => $this->comment,
            'reviewer' => new UserBasicResource($this->whenLoaded('reviewer')),
            'reviewed' => new UserBasicResource($this->whenLoaded('reviewed')),
            'booking_number' => $this->booking?->booking_number,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
