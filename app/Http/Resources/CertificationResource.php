<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource dla certyfikatu
 */
class CertificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'issuer' => $this->issuer,
            'credential_id' => $this->credential_id,
            'description' => $this->description,
            'issue_date' => $this->issue_date?->format('Y-m-d'),
            'expiry_date' => $this->expiry_date?->format('Y-m-d'),
            'is_active' => $this->is_active,
            'is_verified' => $this->is_verified,
            'credential_url' => $this->credential_url,
        ];
    }
}
