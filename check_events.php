<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "📋 Notification Events:\n\n";

$events = App\Models\NotificationEvent::with('templates')->get();

if ($events->isEmpty()) {
    echo "❌ Brak eventów - uruchom seeder!\n";
    echo "php artisan db:seed --class=NotificationEventSeeder\n";
    exit(1);
}

foreach ($events as $event) {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "🔔 {$event->name}\n";
    echo "   Key: {$event->key}\n";
    echo "   Enabled: " . ($event->is_active ? '✅ YES' : '❌ NO') . "\n";
    echo "   Templates: {$event->templates->count()}\n";
    
    foreach ($event->templates as $template) {
        echo "   └─ {$template->recipient_role}: ";
        $channels = [];
        if ($template->email_enabled) $channels[] = 'email';
        if ($template->toast_enabled) $channels[] = 'toast';
        if ($template->push_enabled) $channels[] = 'push';
        if ($template->database_enabled) $channels[] = 'database';
        echo implode(', ', $channels) . "\n";
    }
}

echo "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "Total: {$events->count()} events\n";
