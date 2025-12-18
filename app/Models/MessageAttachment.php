<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/**
 * Model załącznika do wiadomości
 */
class MessageAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'message_id',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'width',
        'height',
        'thumbnail_path',
    ];

    protected $casts = [
        'message_id' => 'integer',
        'file_size' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($attachment) {
            if (empty($attachment->uuid)) {
                $attachment->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Wiadomość, do której należy załącznik
     */
    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }

    /**
     * Czy to obraz
     */
    public function isImage(): bool
    {
        return str_starts_with($this->file_type, 'image/');
    }

    /**
     * Czy to dokument
     */
    public function isDocument(): bool
    {
        return in_array($this->file_type, ['application/pdf', 'application/msword']);
    }
}
