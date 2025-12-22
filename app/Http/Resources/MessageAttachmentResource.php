<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource dla załącznika wiadomości
 */
class MessageAttachmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'file_name' => $this->file_name,
            'file_type' => $this->file_type,
            'file_size' => $this->file_size,
            'width' => $this->width,
            'height' => $this->height,
            'url' => secure_asset('storage/' . $this->file_path),
            'thumbnail_url' => $this->thumbnail_path ? secure_asset('storage/' . $this->thumbnail_path) : null,
        ];
    }
}
