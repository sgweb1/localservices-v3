<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource dla wiadomości
 */
class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'sender_id' => $this->sender_id,
            'sender' => new UserBasicResource($this->whenLoaded('sender')),
            'content' => $this->content,
            'read_at' => $this->read_at?->toIso8601String(),
            'sent_at' => $this->sent_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
