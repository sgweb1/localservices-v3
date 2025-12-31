<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource dla rezerwacji
 */
class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $formattedAddress = $this->formatServiceAddress();
        
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'booking_number' => $this->booking_number,
            'bookingNumber' => $this->booking_number,
            'status' => $this->status,
            'booking_date' => $this->booking_date?->format('Y-m-d'),
            'bookingDate' => $this->booking_date?->format('Y-m-d'),
            'start_time' => $this->start_time,
            'startTime' => $this->start_time,
            'end_time' => $this->end_time,
            'endTime' => $this->end_time,
            'duration_minutes' => $this->duration_minutes,
            'durationMinutes' => $this->duration_minutes,
            'service_address' => $formattedAddress,
            'serviceAddress' => $formattedAddress,
            'location' => $formattedAddress, // Dodaj location field dla backward compatibility
            'distance_km' => (float) $this->distance_km,
            'service_price' => (float) ($this->service_price ?? 0),
            'servicePrice' => (float) ($this->service_price ?? 0),
            'total_price' => (float) $this->total_price,
            'totalPrice' => (float) $this->total_price,
            'currency' => $this->currency,
            'payment_status' => $this->payment_status,
            'paymentStatus' => $this->payment_status,
            'customer_notes' => $this->customer_notes,
            'customerNotes' => $this->customer_notes,
            'provider_notes' => $this->provider_notes,
            'providerNotes' => $this->provider_notes,
            
            // Hidden flags
            'hidden_by_provider' => (bool) $this->hidden_by_provider,
            'hiddenByProvider' => (bool) $this->hidden_by_provider,
            'isHidden' => (bool) $this->hidden_by_provider, // Alias dla frontend
            
            // Frontend expects these flattened
            'customer_id' => $this->customer_id,
            'customerId' => $this->customer_id,
            'customer_name' => $this->customer?->name ?? 'Nieznany klient',
            'customerName' => $this->customer?->name ?? 'Nieznany klient',
            'service_name' => $this->service?->title ?? 'Nieznana usługa',
            'serviceName' => $this->service?->title ?? 'Nieznana usługa',
            'service' => new ServiceResource($this->whenLoaded('service')),
            'customer' => new UserBasicResource($this->whenLoaded('customer')),
            'provider' => new UserBasicResource($this->whenLoaded('provider')),
        ];
    }

    private function formatServiceAddress(): ?array
    {
        if (!$this->service_address) {
            return null;
        }

        $decoded = is_string($this->service_address) 
            ? json_decode($this->service_address, true)
            : $this->service_address;

        return [
            'street' => $decoded['street'] ?? null,
            'postalCode' => $decoded['postal_code'] ?? $decoded['postalCode'] ?? null,
            'city' => $decoded['city'] ?? null,
        ];
    }
}
