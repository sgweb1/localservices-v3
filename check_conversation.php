<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Get both users
$anna = App\Models\User::where('name', 'like', '%Anna%')->first();
$andrzej = App\Models\User::where('name', 'like', '%Andrzej%')->first();

echo "=== USER DATA ===\n";
if ($anna) {
    echo "Anna:\n";
    echo "  ID: " . $anna->id . "\n";
    echo "  last_seen_at: " . ($anna->last_seen_at ? $anna->last_seen_at->toDateTimeString() : 'NULL') . "\n";
    echo "  isOnline(): " . ($anna->isOnline() ? 'YES' : 'NO') . "\n";
}

if ($andrzej) {
    echo "Andrzej:\n";
    echo "  ID: " . $andrzej->id . "\n";
    echo "  last_seen_at: " . ($andrzej->last_seen_at ? $andrzej->last_seen_at->toDateTimeString() : 'NULL') . "\n";
    echo "  isOnline(): " . ($andrzej->isOnline() ? 'YES' : 'NO') . "\n";
}

// Get a conversation
echo "\n=== CONVERSATION RESOURCE ===\n";
$conversation = App\Models\Conversation::first();
if ($conversation && $anna) {
    // Simulate Anna being logged in
    auth()->login($anna);
    
    $resource = new App\Http\Resources\ConversationResource($conversation);
    $data = $resource->resolve();
    
    echo "Conversation:\n";
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
