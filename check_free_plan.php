<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$free = App\Models\SubscriptionPlan::where('slug', 'free')->first();

if ($free) {
    echo "✓ FREE plan exists:\n";
    echo "  ID: {$free->id}\n";
    echo "  Name: {$free->name}\n";
    echo "  Slug: {$free->slug}\n";
    echo "  Price: {$free->price_monthly}\n";
} else {
    echo "✗ FREE plan NOT FOUND\n";
    echo "\nExisting plans:\n";
    App\Models\SubscriptionPlan::orderBy('display_order')->get()->each(function($plan) {
        echo "  {$plan->id}: {$plan->name} ({$plan->slug}) - {$plan->price_monthly} PLN\n";
    });
}
