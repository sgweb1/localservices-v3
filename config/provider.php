<?php

return [
    'limits' => [
        // Maksymalna liczba aktywnych usług na providera (proste ograniczenie do czasu wdrożenia planów)
        'max_active_services' => env('PROVIDER_MAX_ACTIVE_SERVICES', 5),
    ],
];
