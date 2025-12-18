<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource dla elementu portfolio
 */
class PortfolioItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'title' => $this->title,
            'description' => $this->description,
            'category' => $this->category,
            'image_paths' => $this->image_paths,
            'thumbnail_path' => $this->thumbnail_path,
            'completed_at' => $this->completed_at?->format('Y-m-d'),
            'project_value' => (float) $this->project_value,
            'duration_days' => $this->duration_days,
            'views' => $this->views,
            'likes' => $this->likes,
            'is_verified' => $this->is_verified,
            'average_rating' => round($this->getAverageRating(), 2),
            'comments_count' => $this->getCommentsCount(),
        ];
    }
}
