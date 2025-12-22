<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$user = App\Models\User::where('name', 'like', '%Anna%')->first();

if ($user) {
    echo "User: " . $user->name . "\n";
    echo "ID: " . $user->id . "\n";
    echo "last_seen_at: " . ($user->last_seen_at ? $user->last_seen_at->toDateTimeString() : 'NULL') . "\n";
    echo "isOnline(): " . ($user->isOnline() ? 'YES' : 'NO') . "\n";
    if ($user->last_seen_at) {
        echo "Minutes ago: " . now()->diffInMinutes($user->last_seen_at) . "\n";
    }
} else {
    echo "User not found\n";
}
