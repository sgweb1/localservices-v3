<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

class ExceptCsrfOnApi extends VerifyCsrfToken
{
    /**
     * The URIs that should be excluded from CSRF verification.
     */
    protected $except = [
        'api/*',
    ];
}
