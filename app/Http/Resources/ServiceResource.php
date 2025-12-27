<?php

namespace App\Http\Resources;

use App\Helpers\StorageHelper;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource dla usługi z danymi providera
 */
class ServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $photos = $this->whenLoaded('photos', function () {
            return $this->photos
                ->sortBy('position')
                ->values()
                ->map(function ($p) {
                    return [
                        'id' => $p->id,
                        'uuid' => $p->uuid,
                        'url' => StorageHelper::getPublicUrl($p->image_path),
                        'alt_text' => $p->alt_text,
                        'is_primary' => (bool) $p->is_primary,
                        'position' => (int) $p->position,
                    ];
                });
        });

        $primaryPhotoUrl = null;
        if ($this->relationLoaded('photos')) {
            $primary = $this->photos->firstWhere('is_primary', true) ?? $this->photos->sortBy('position')->first();
            if ($primary) {
                $primaryPhotoUrl = StorageHelper::getPublicUrl($primary->image_path);
            }
        }

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
            'primary_photo_url' => $primaryPhotoUrl,
            'photos' => $photos,
            'provider' => [
                'id' => $this->provider_id,
                'uuid' => $this->provider?->uuid,
                'name' => $this->provider?->name,
                'avatar' => $this->provider?->avatar,
                'rating_average' => (float) ($this->provider?->rating_average ?? 0),
                'rating_count' => (int) ($this->provider?->rating_count ?? 0),
            ],
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
