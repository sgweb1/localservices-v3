<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * Model rozmowy (Conversation)
 * 
 * Reprezentuje konwersację między customerem a providerem.
 * Może być powiązana z booking lub service.
 */
class Conversation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'customer_id',
        'provider_id',
        'booking_id',
        'service_id',
        'subject',
        'last_message',
        'last_message_at',
        'customer_active',
        'provider_active',
        'customer_read_at',
        'provider_read_at',
    ];

    protected $casts = [
        'customer_id' => 'integer',
        'provider_id' => 'integer',
        'booking_id' => 'integer',
        'service_id' => 'integer',
        'customer_active' => 'boolean',
        'provider_active' => 'boolean',
        'customer_read_at' => 'datetime',
        'provider_read_at' => 'datetime',
        'last_message_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($conversation) {
            if (empty($conversation->uuid)) {
                $conversation->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Customer w tej rozmowie
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    /**
     * Provider w tej rozmowie
     */
    public function provider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

    /**
     * Booking powiązany (jeśli istnieje)
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Usługa powiązana (jeśli istnieje)
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Wiadomości w tej rozmowie
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }

    /**
     * Scope - aktywne rozmowy (nie usunięte przez żaden stronę)
     */
    public function scopeActive($query)
    {
        return $query->where('customer_active', true)->where('provider_active', true);
    }

    /**
     * Scope - rozmowy dla danego użytkownika
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('customer_id', $userId)->where('customer_active', true)
              ->orWhere(function ($q2) use ($userId) {
                  $q2->where('provider_id', $userId)->where('provider_active', true);
              });
        });
    }

    /**
     * Scope - nieprzeczytane rozmowy
     */
    public function scopeUnread($query, $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('customer_id', $userId)->where(function ($q2) {
                $q2->whereNull('customer_read_at')->orWhereRaw('customer_read_at < last_message_at');
            })->orWhere(function ($q3) use ($userId) {
                $q3->where('provider_id', $userId)->where(function ($q4) {
                    $q4->whereNull('provider_read_at')->orWhereRaw('provider_read_at < last_message_at');
                });
            });
        });
    }

    /**
     * Drugi uczestnik rozmowy (dla danego użytkownika)
     */
    public function otherUser($userId): User
    {
        return $this->customer_id === $userId ? $this->provider : $this->customer;
    }

    /**
     * Czy rozmowa ma nieprzeczytane wiadomości (dla danego użytkownika)
     */
    public function hasUnread($userId): bool
    {
        if ($this->customer_id === $userId) {
            return $this->customer_read_at === null || $this->customer_read_at < $this->last_message_at;
        }
        return $this->provider_read_at === null || $this->provider_read_at < $this->last_message_at;
    }

    /**
     * Oznacz rozmowę jako przeczytaną
     */
    public function markAsRead($userId): void
    {
        if ($this->customer_id === $userId) {
            $this->update(['customer_read_at' => now()]);
        } else {
            $this->update(['provider_read_at' => now()]);
        }
    }
}
