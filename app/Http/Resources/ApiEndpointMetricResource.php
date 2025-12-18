<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * ApiEndpointMetricResource - Format metryki API endpoints
 */
class ApiEndpointMetricResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'endpoint' => $this->endpoint,
            'method' => $this->method,
            'metric_date' => $this->metric_date->toDateString(),
            'traffic' => [
                'request_count' => $this->request_count,
                'error_count' => $this->error_count,
                'not_found_count' => $this->not_found_count,
                'error_rate' => $this->error_rate,
            ],
            'performance' => [
                'avg_response_time_ms' => $this->avg_response_time_ms,
                'p95_response_time_ms' => $this->p95_response_time_ms,
                'p99_response_time_ms' => $this->p99_response_time_ms,
                'min_response_time_ms' => $this->min_response_time_ms,
                'max_response_time_ms' => $this->max_response_time_ms,
            ],
            'database' => [
                'avg_query_count' => $this->avg_query_count,
                'avg_query_time_ms' => $this->avg_query_time_ms,
            ],
        ];
    }
}
