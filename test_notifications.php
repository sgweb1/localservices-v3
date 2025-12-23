<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "🧪 Test Systemu Powiadomień\n\n";

// Pobierz użytkownika
$user = App\Models\User::first();
if (!$user) {
    echo "❌ Brak użytkowników w bazie\n";
    exit(1);
}

echo "👤 Testowy użytkownik: {$user->email} (ID: {$user->id})\n\n";

// Pobierz dispatcher
$dispatcher = app(App\Services\Notifications\NotificationDispatcher::class);

// Test wysyłki powiadomienia
echo "📤 Wysyłam powiadomienie 'booking.created'...\n";
$result = $dispatcher->send(
    'booking.created',
    $user,
    'customer',
    [
        'booking_number' => 'TEST-123',
        'service_name' => 'Sprzątanie mieszkania',
        'provider_name' => 'Jan Kowalski',
        'booking_date' => '2025-12-25 10:00',
    ]
);

echo "\n📊 Wynik:\n";
echo "Success: " . ($result['success'] ? '✅ TAK' : '❌ NIE') . "\n";
echo "Channels: " . implode(', ', $result['channels']) . "\n";

if (isset($result['error'])) {
    echo "Error: {$result['error']}\n";
}

if (isset($result['results'])) {
    echo "\n📝 Szczegóły kanałów:\n";
    foreach ($result['results'] as $channel => $sent) {
        echo "  - {$channel}: " . ($sent ? '✅' : '❌') . "\n";
    }
}

echo "\n✅ Test zakończony\n";
