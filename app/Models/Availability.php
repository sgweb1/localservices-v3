<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * Model dostępności providera
 * 
 * Definiuje godziny pracy dla każdego dnia tygodnia
 */
class Availability extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'provider_id',
        'day_of_week',
        'start_time',
        'end_time',
        'max_bookings',
        'current_bookings',
        'is_available',
        'break_time_start',
        'break_time_end',
    ];

    protected $casts = [
        'provider_id' => 'integer',
        'day_of_week' => 'integer',
        'max_bookings' => 'integer',
        'current_bookings' => 'integer',
        'is_available' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($availability) {
            if (empty($availability->uuid)) {
                $availability->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Provider
     */
    public function provider(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope - dostępne dni
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    /**
     * Scope - dla danego providera
     */
    public function scopeForProvider($query, $providerId)
    {
        return $query->where('provider_id', $providerId);
    }

    /**
     * Scope - dla konkretnego dnia tygodnia
     */
    public function scopeForDayOfWeek($query, $dayOfWeek)
    {
        return $query->where('day_of_week', $dayOfWeek);
    }

    /**
     * Czy jest wolne miejsce w tym dniu
     */
    public function hasSpaceAvailable(): bool
    {
        return $this->current_bookings < $this->max_bookings;
    }

    /**
     * Zwróć nazwę dnia tygodnia
     */
    public function getDayNameAttribute(): string
    {
        $days = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
        return $days[$this->day_of_week] ?? 'nieznany dzień';
    }

    /**
     * Czy czas wpada w przerwę
     */
    public function isInBreakTime($time): bool
    {
        if (!$this->break_time_start || !$this->break_time_end) {
            return false;
        }
        return $time >= $this->break_time_start && $time <= $this->break_time_end;
    }
}
