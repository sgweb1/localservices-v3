<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * Model faktury
 */
class Invoice extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'payment_id',
        'invoice_number',
        'type',
        'status',
        'description',
        'subtotal',
        'vat_rate',
        'vat_amount',
        'total_amount',
        'currency',
        'issued_at',
        'due_at',
        'paid_at',
        'document_path',
        'notes',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'payment_id' => 'integer',
        'subtotal' => 'decimal:2',
        'vat_rate' => 'decimal:2',
        'vat_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'issued_at' => 'datetime',
        'due_at' => 'datetime',
        'paid_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($invoice) {
            if (empty($invoice->uuid)) {
                $invoice->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Użytkownik
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Płatność
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    /**
     * Pozycje na fakturze
     */
    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    /**
     * Scope - opłacone
     */
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    /**
     * Scope - zaległe
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', 'overdue');
    }

    /**
     * Czy faktura jest opłacona
     */
    public function isPaid(): bool
    {
        return $this->status === 'paid' && $this->paid_at !== null;
    }
}
