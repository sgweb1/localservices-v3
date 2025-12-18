<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * ApiEndpointMetric - Metryki wydajności API endpoints
 * 
 * @property int $id
 * @property string $endpoint
 * @property string $method
 * @property \Carbon\Carbon $metric_date
 * @property int $request_count
 * @property float $avg_response_time_ms
 * @property float $error_rate
 */
class ApiEndpointMetric extends Model
{
    use HasFactory;

    protected $fillable = [
        'endpoint',
        'method',
        'metric_date',
        'request_count',
        'error_count',
        'not_found_count',
        'error_rate',
        'avg_response_time_ms',
        'p95_response_time_ms',
        'p99_response_time_ms',
        'min_response_time_ms',
        'max_response_time_ms',
        'avg_query_count',
        'avg_query_time_ms',
    ];

    protected $casts = [
        'metric_date' => 'date',
    ];
}
