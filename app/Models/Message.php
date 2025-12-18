<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * Model wiadomości
 */
class Message extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'body',
        'metadata',
        'read_at',
        'is_edited',
        'edited_at',
    ];

    protected $casts = [
        'conversation_id' => 'integer',
        'sender_id' => 'integer',
        'metadata' => 'array',
        'is_edited' => 'boolean',
        'read_at' => 'datetime',
        'edited_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($message) {
            if (empty($message->uuid)) {
                $message->uuid = (string) Str::uuid();
            }
        });

        // Aktualizuj last_message w conversation
        static::created(function ($message) {
            $message->conversation->update([
                'last_message' => $message->body,
                'last_message_at' => $message->created_at,
            ]);
        });
    }

    /**
     * Rozmowa, do której należy wiadomość
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * Nadawca wiadomości
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Załączniki do wiadomości
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(MessageAttachment::class);
    }

    /**
     * Czy wiadomość może być edytowana (przez autora)
     */
    public function canBeEditedBy($userId): bool
    {
        return $this->sender_id === $userId && now()->diffInMinutes($this->created_at) < 15;
    }

    /**
     * Oznacz wiadomość jako przeczytaną
     */
    public function markAsRead(): void
    {
        if ($this->read_at === null) {
            $this->update(['read_at' => now()]);
        }
    }
}
