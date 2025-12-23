<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "VAPID Configuration Check:\n";
echo "==========================\n\n";

$publicKey = config('broadcasting.notifications.push.public_key');
$privateKey = config('broadcasting.notifications.push.private_key');
$subject = config('broadcasting.notifications.push.subject');

echo "Public Key: " . ($publicKey ? substr($publicKey, 0, 20) . '...' : 'NOT SET') . "\n";
echo "Private Key: " . ($privateKey ? 'SET (' . strlen($privateKey) . ' chars)' : 'NOT SET') . "\n";
echo "Subject: " . ($subject ?: 'NOT SET') . "\n";
echo "\n";

if ($publicKey && $privateKey && $subject) {
    echo "✅ All VAPID keys are configured!\n";
} else {
    echo "❌ Some VAPID keys are missing!\n";
}
