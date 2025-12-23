<?php

return [
    'vapid' => [
        'subject' => env('VAPID_SUBJECT', 'mailto:support@ls2.local'),
        'public_key' => env('VAPID_PUBLIC_KEY'),
        'private_key' => env('VAPID_PRIVATE_KEY'),
    ],

    'ttl' => env('WEB_PUSH_TTL', 300),
];
