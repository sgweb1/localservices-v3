#!/bin/bash
cd /home/szymo/projects/ls2
php artisan tinker << 'EOF'
$users = App\Models\User::with('roles')->get(['id', 'name', 'email', 'user_type', 'is_admin']);
foreach($users as $u) {
    echo $u->name . ' (' . $u->email . ') - Roles: ' . $u->roles->pluck('name')->join(', ') . ' - is_admin: ' . ($u->is_admin ? 'TAK' : 'NIE') . PHP_EOL;
}
EOF
