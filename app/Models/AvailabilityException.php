<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/**
 * Model wyjątku dostępności (urlop, choroba, itp)
 */
class AvailabilityException extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider_id',
        'start_date',
        'end_date',
        'reason',
        'description',
        'is_approved',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'provider_id' => 'integer',
        'start_date' => 'date',
        'end_date' => 'date',
        'is_approved' => 'boolean',
        'approved_by' => 'integer',
        'approved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($exception) {
            if (empty($exception->uuid)) {
                $exception->uuid = (string) Str::uuid();
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
     * Admin, który zatwierdził
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Czy wyjątek pokrywa dany dzień
     */
    public function coveresDate($date): bool
    {
        return $date >= $this->start_date && $date <= $this->end_date;
    }
}
