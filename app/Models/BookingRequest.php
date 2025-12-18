<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/**
 * Model zapytania ofertowego (Request Quote)
 *
 * Reprezentuje zapytanie klienta o wycenę usługi.
 * Provider musi zaakceptować i podać cenę przed utworzeniem rezerwacji.
 *
 * Workflow statusów:
 * - pending: Oczekuje na wycenę od providera
 * - quoted: Provider podał wycenę
 * - accepted: Klient zaakceptował → tworzy się Booking
 * - rejected: Klient odrzucił ofertę
 * - expired: Oferta wygasła (quote_valid_until)
 * - cancelled: Anulowane przez którąś stronę
 */
class BookingRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'request_number',
        'customer_id',
        'provider_id',
        'service_id',
        'booking_id',
        'description',
        'service_address',
        'latitude',
        'longitude',
        'preferred_date',
        'preferred_time',
        'attachments',
        'budget_min',
        'budget_max',
        'quoted_price',
        'quote_details',
        'quote_valid_until',
        'estimated_duration_hours',
        'status',
        'quoted_at',
        'accepted_at',
        'rejected_at',
        'expired_at',
        'cancelled_at',
    ];

    protected function casts(): array
    {
        return [
            'preferred_date' => 'date',
            'preferred_time' => 'datetime:H:i',
            'attachments' => 'array',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'budget_min' => 'decimal:2',
            'budget_max' => 'decimal:2',
            'quoted_price' => 'decimal:2',
            'quote_valid_until' => 'date',
            'estimated_duration_hours' => 'integer',
            'quoted_at' => 'datetime',
            'accepted_at' => 'datetime',
            'rejected_at' => 'datetime',
            'expired_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    /**
     * Boot model - automatyczne generowanie UUID i request_number
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($request) {
            if (empty($request->uuid)) {
                $request->uuid = (string) Str::uuid();
            }

            if (empty($request->request_number)) {
                $request->request_number = self::generateRequestNumber();
            }
        });
    }

    /**
     * Generuje unikalny numer zapytania (RQ-2025-00001)
     */
    protected static function generateRequestNumber(): string
    {
        $year = now()->year;
        $lastRequest = self::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $nextNumber = $lastRequest ? (int) substr($lastRequest->request_number, -5) + 1 : 1;

        return sprintf('RQ-%d-%05d', $year, $nextNumber);
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
     * Relacja do utworzonej rezerwacji (po akceptacji)
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Scope: oczekujące na wycenę
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope: wycenione przez providera
     */
    public function scopeQuoted($query)
    {
        return $query->where('status', 'quoted');
    }

    /**
     * Scope: zaakceptowane
     */
    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    /**
     * Scope: aktywne (pending lub quoted)
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['pending', 'quoted']);
    }

    /**
     * Sprawdza czy provider może dodać wycenę
     */
    public function canBeQuoted(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Sprawdza czy klient może zaakceptować ofertę
     */
    public function canBeAccepted(): bool
    {
        return $this->status === 'quoted' &&
            (!$this->quote_valid_until || $this->quote_valid_until->isFuture());
    }

    /**
     * Sprawdza czy klient może odrzucić ofertę
     */
    public function canBeRejected(): bool
    {
        return in_array($this->status, ['pending', 'quoted']);
    }

    /**
     * Sprawdza czy oferta wygasła
     */
    public function isExpired(): bool
    {
        return $this->status === 'quoted' &&
            $this->quote_valid_until &&
            $this->quote_valid_until->isPast();
    }
}
