<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Media Driver
    |--------------------------------------------------------------------------
    |
    | Driver używany do zarządzania mediami:
    | - 'local': Lokalne storage (storage/app/public)
    | - 'cloud': Cloud storage (S3/CloudFlare R2)
    |
    */
    'driver' => env('MEDIA_DRIVER', 'local'),

    /*
    |--------------------------------------------------------------------------
    | Drivers Configuration
    |--------------------------------------------------------------------------
    */
    'drivers' => [
        'local' => [
            'disk' => 'public',
            'url' => env('APP_URL') . '/storage',
        ],

        'cloud' => [
            'disk' => env('CLOUD_DISK', 's3'),
            'cdn' => env('CDN_URL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Image Sizes
    |--------------------------------------------------------------------------
    |
    | Rozmiary generowanych thumbnails dla różnych typów mediów
    */
    'sizes' => [
        'avatar' => [
            'large' => 512,
            'medium' => 256,
            'thumb' => 128,
        ],

        'portfolio' => [
            'large' => 1200,
            'thumb' => 400,
        ],

        'service' => [
            'large' => 1200,
            'medium' => 800,
            'thumb' => 400,
        ],

        'review' => [
            'large' => 1200,
            'thumb' => 400,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Optimization Settings
    |--------------------------------------------------------------------------
    */
    'optimization' => [
        'jpeg_quality' => 85,
        'strip_exif' => true,
        'progressive' => true,
    ],
];
