<?php

namespace App\Console\Commands;

use App\Models\PushSubscription;
use Illuminate\Console\Command;

class CleanExpiredPushSubscriptions extends Command
{
    protected $signature = 'notifications:clean-subscriptions {--days=30 : Remove subscriptions inactive for X days}';
    protected $description = 'Remove expired or inactive push subscriptions';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $cutoff = now()->subDays($days);

        // Remove subscriptions that haven't been updated in X days
        $removed = PushSubscription::where('updated_at', '<', $cutoff)->delete();

        $this->info("Removed {$removed} inactive push subscriptions (not updated for {$days} days)");

        return Command::SUCCESS;
    }
}
