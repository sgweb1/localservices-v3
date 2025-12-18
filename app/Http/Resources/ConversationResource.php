<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource dla rozmowy
 */
class ConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'customer' => new UserBasicResource($this->whenLoaded('customer')),
            'provider' => new UserBasicResource($this->whenLoaded('provider')),
            'last_message' => new MessageResource($this->whenLoaded('lastMessage')),
            'unread_count' => $this->unread_count ?? 0,
            'updated_at' => $this->updated_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
