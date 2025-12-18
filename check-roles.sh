#!/bin/bash
cd /home/szymo/projects/ls2
php artisan tinker --execute="
echo 'Users: ' . App\Models\User::count() . PHP_EOL;
echo 'Roles: ' . Spatie\Permission\Models\Role::count() . PHP_EOL;
echo 'Role assignments: ' . DB::table('model_has_roles')->count() . PHP_EOL;
echo PHP_EOL;
echo '=== Providerzy z rolami ===' . PHP_EOL;
\$providers = App\Models\User::with('roles')->where('user_type', 'provider')->get(['id', 'name', 'email']);
foreach(\$providers as \$p) {
    echo \$p->name . ' - Roles: ' . \$p->roles->pluck('name')->join(', ') . PHP_EOL;
}
echo PHP_EOL;
echo '=== Customers z rolami ===' . PHP_EOL;
\$customers = App\Models\User::with('roles')->where('user_type', 'customer')->get(['id', 'name', 'email', 'is_admin']);
foreach(\$customers as \$c) {
    echo \$c->name . ' - Roles: ' . \$c->roles->pluck('name')->join(', ') . ' - is_admin: ' . (\$c->is_admin ? 'TAK' : 'NIE') . PHP_EOL;
}
"
