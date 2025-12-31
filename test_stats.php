<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = App\Models\User::where('email', 'hydraulik1@example.com')->first();

if (!$user) {
    echo "User not found!\n";
    exit(1);
}

echo "User: {$user->name} (ID: {$user->id})\n\n";

$service = new App\Services\Api\ProviderDashboardApiService();
$widgets = $service->getDashboardWidgets($user, ['stats']);

echo "Widgets response:\n";
print_r($widgets);

echo "\n\nDatabase checks:\n";

// Check bookings
$upcomingBookings = App\Models\Booking::query()
    ->where('provider_id', $user->id)
    ->whereIn('status', ['pending', 'confirmed'])
    ->where('booking_date', '>=', now())
    ->where('booking_date', '<=', now()->addDays(7))
    ->get(['id', 'status', 'booking_date']);

echo "Upcoming bookings (next 7 days):\n";
foreach ($upcomingBookings as $booking) {
    echo "  - ID {$booking->id}: {$booking->status} on {$booking->booking_date}\n";
}
echo "Total: " . $upcomingBookings->count() . "\n\n";

// Check services
$activeServices = $user->serviceListings()->where('status', 'active')->get(['id', 'title', 'status']);

echo "Active services:\n";
foreach ($activeServices as $svc) {
    echo "  - ID {$svc->id}: {$svc->title} ({$svc->status})\n";
}
echo "Total: " . $activeServices->count() . "\n";
