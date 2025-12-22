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
        $currentUserId = auth()?->id();
        $otherUserId = null;
        
        if ($currentUserId === $this->customer_id) {
            $otherUserId = $this->provider_id;
            $otherUser = $this->provider;
        } else {
            $otherUserId = $this->customer_id;
            $otherUser = $this->customer;
        }

        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'customer' => new UserBasicResource($this->whenLoaded('customer')),
            'provider' => new UserBasicResource($this->whenLoaded('provider')),
            'other_user' => new UserBasicResource($otherUser),
            // Front w React oczekuje stringa w polu last_message
            'last_message' => $this->last_message ?? $this->lastMessage?->body,
            // Do potencjalnego rozszerzenia w UI zostawiamy też pełny obiekt (opcjonalnie preloadowany)
            'last_message_object' => new MessageResource($this->whenLoaded('lastMessage')),
            'unread_count' => $this->unread_count ?? 0,
            'is_hidden_for_current_user' => $this->is_hidden_for_current_user ?? false,
            'last_message_at' => $this->last_message_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
