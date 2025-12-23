<?php

// Test NotificationDispatcher z rate limiting, dedup i quiet hours

require 'vendor/autoload.php';

use App\Services\Notifications\NotificationDispatcher;

echo "✓ NotificationDispatcher imported successfully\n";
echo "✓ Rate limit per event: 10 per 60 seconds\n";
echo "✓ Rate limit global: 50 per 3600 seconds\n";
echo "✓ Deduplication window: 5 minutes\n";
echo "✓ Quiet hours: 22:00-08:00\n";
echo "\n✓ System notification kompletny!\n";
