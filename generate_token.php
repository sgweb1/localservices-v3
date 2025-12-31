<?php
require __DIR__ . '/vendor/autoload.php';

(require_once __DIR__ . '/bootstrap/app.php')
    ->make(\Illuminate\Contracts\Console\Kernel::class)
    ->bootstrap();

use App\Models\User;

$user = User::where('email', 'hydraulik1@example.com')->first();

if ($user) {
    $token = $user->createToken('test-api-token')->plainTextToken;
    echo "\n✅ Token wygenerowany dla: {$user->email}\n";
    echo "Role: {$user->role}\n";
    echo "\n🔑 Bearer Token:\n";
    echo $token . "\n\n";
    echo "Użycie:\n";
    echo "TEST_AUTH_TOKEN=\"{$token}\" npx vitest tests/e2e/api.test.ts --environment=node --run\n\n";
} else {
    echo "❌ Użytkownik nie znaleziony\n";
}
