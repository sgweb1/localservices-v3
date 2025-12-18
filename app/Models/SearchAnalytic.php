<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * SearchAnalytic - Śledzenie wyszukiwań i analytics
 * 
 * @property int $id
 * @property string $uuid
 * @property int|null $user_id
 * @property string $search_query
 * @property string|null $service_category
 * @property string|null $city
 * @property int $results_count
 * @property int $results_clicked
 * @property bool $conversion_happened
 */
class SearchAnalytic extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'user_id',
        'search_query',
        'service_category',
        'city',
        'results_count',
        'results_clicked',
        'first_result_clicked',
        'conversion_happened',
        'time_to_booking_seconds',
        'device',
    ];

    protected $casts = [
        'first_result_clicked' => 'boolean',
        'conversion_happened' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
