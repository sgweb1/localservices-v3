<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Event - Zdarzenia API (performance & behavior tracking)
 * 
 * @property int $id
 * @property string $uuid
 * @property string $event_name
 * @property string $event_type
 * @property int|null $response_time_ms
 * @property string|null $http_method
 * @property string|null $http_status
 * @property array $metadata
 */
class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'event_name',
        'event_type',
        'model_type',
        'model_id',
        'response_time_ms',
        'http_method',
        'http_status',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function model()
    {
        return $this->morphTo();
    }
}
