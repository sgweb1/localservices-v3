<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * Model rezerwacji marketplace (Instant Booking)
 *
 * Reprezentuje potwierdzoną rezerwację usługi.
 * Instant Booking = natychmiastowe potwierdzenie bez akceptacji providera.
 *
 * Workflow statusów:
 * - confirmed: Zarezerwowane (domyślnie dla Instant Booking)
 * - in_progress: W trakcie realizacji
 * - completed: Zakończone (można dodać recenzję)
 * - cancelled: Anulowane (może być opłata za anulowanie)
 * - no_show: Klient się nie stawił
 * - disputed: Sporna (wymaga interwencji administracji)
 */
class Booking extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'booking_number',
        'customer_id',
        'provider_id',
        'service_id',
        'booking_date',
        'start_time',
        'end_time',
        'duration_minutes',
        'service_address',
        'latitude',
        'longitude',
        'distance_km',
        'service_price',
        'travel_fee',
        'platform_fee',
        'total_price',
        'currency',
        'payment_status',
        'payment_method',
        'paid_at',
        'payment_reference',
        'status',
        'cancelled_by',
        'cancelled_at',
        'cancellation_reason',
        'cancellation_fee',
        'customer_notes',
        'provider_notes',
        'admin_notes',
        'special_requirements',
        'confirmed_at',
        'started_at',
        'completed_at',
        'customer_reviewed',
        'provider_reviewed',
        'hidden_by_provider',
        'hidden_by_customer',
        'is_test_data',
    ];

    protected function casts(): array
    {
        return [
            'booking_date' => 'date',
            'service_address' => 'array',
            'special_requirements' => 'array',
            'duration_minutes' => 'integer',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'distance_km' => 'decimal:2',
            'service_price' => 'decimal:2',
            'travel_fee' => 'decimal:2',
            'platform_fee' => 'decimal:2',
            'total_price' => 'decimal:2',
            'cancellation_fee' => 'decimal:2',
            'paid_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'confirmed_at' => 'datetime',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'customer_reviewed' => 'boolean',
            'provider_reviewed' => 'boolean',
            'hidden_by_provider' => 'boolean',
            'hidden_by_customer' => 'boolean',
            'is_test_data' => 'boolean',
        ];
    }

    /**
     * Domyślne wartości dla wymaganych pól cenowych
     */
    protected $attributes = [
        'service_price' => 0,
        'travel_fee' => 0,
        'platform_fee' => 0,
        'total_price' => 0,
        'currency' => 'PLN',
        'hidden_by_provider' => false,
        'hidden_by_customer' => false,
    ];

    /**
     * Boot model - automatyczne generowanie UUID i booking_number
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($booking) {
            if (empty($booking->uuid)) {
                $booking->uuid = (string) Str::uuid();
            }

            if (empty($booking->booking_number)) {
                $booking->booking_number = self::generateBookingNumber();
            }

            // Instant Booking = confirmed od razu
            if (empty($booking->status)) {
                $booking->status = 'confirmed';
                $booking->confirmed_at = now();
            }
        });
    }

    /**
     * Generuje unikalny numer rezerwacji (BK-2025-00001)
     */
    protected static function generateBookingNumber(): string
    {
        $year = now()->year;
        $lastBooking = self::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $nextNumber = $lastBooking ? (int) substr($lastBooking->booking_number, -5) + 1 : 1;

        return sprintf('BK-%d-%05d', $year, $nextNumber);
    }

    /**
     * Relacja do klienta
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    /**
     * Relacja do providera
     */
    public function provider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

    /**
     * Relacja do usługi
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Relacja do użytkownika, który anulował rezerwację
     */
    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    /**
     * Scope: tylko aktywne rezerwacje (nie anulowane)
     */
    public function scopeActive($query)
    {
        return $query->whereNotIn('status', ['cancelled', 'no_show', 'disputed']);
    }

    /**
     * Scope: nadchodzące rezerwacje
     */
    public function scopeUpcoming($query)
    {
        return $query->where('booking_date', '>=', now()->toDateString())
            ->whereIn('status', ['confirmed', 'pending']);
    }

    /**
     * Scope: zakończone rezerwacje
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope: rezerwacje wymagające recenzji
     */
    public function scopeNeedsReview($query, User $user)
    {
        $isCustomer = $user->isCustomer();

        return $query->where('status', 'completed')
            ->where(function ($q) use ($user, $isCustomer) {
                if ($isCustomer) {
                    $q->where('customer_id', $user->id)
                        ->where('customer_reviewed', false);
                } else {
                    $q->where('provider_id', $user->id)
                        ->where('provider_reviewed', false);
                }
            });
    }

    /**
     * Sprawdza czy rezerwacja może zostać anulowana
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['confirmed', 'pending']);
    }

    /**
     * Recenzje powiązane z tą rezerwacją
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Sprawdza czy rezerwacja może zostać rozpoczęta
     */
    public function canBeStarted(): bool
    {
        return $this->status === 'confirmed' &&
            $this->booking_date->isToday();
    }

    /**
     * Sprawdza czy rezerwacja może zostać zakończona
     */
    public function canBeCompleted(): bool
    {
        return $this->status === 'in_progress';
    }

    /**
     * Sprawdza czy użytkownik może dodać recenzję
     */
    public function canBeReviewed(User $user): bool
    {
        if ($this->status !== 'completed') {
            return false;
        }

        if ($user->id === $this->customer_id) {
            return !$this->customer_reviewed;
        }

        if ($user->id === $this->provider_id) {
            return !$this->provider_reviewed;
        }

        return false;
    }
}
