<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notification_logs', function (Blueprint $table) {
            $table->boolean('read')->default(false)->after('success');
            $table->timestamp('read_at')->nullable()->after('read');
            
            $table->index(['user_id', 'read', 'created_at'], 'idx_user_read_created');
        });
    }

    public function down(): void
    {
        Schema::table('notification_logs', function (Blueprint $table) {
            $table->dropIndex('idx_user_read_created');
            $table->dropColumn(['read', 'read_at']);
        });
    }
};
