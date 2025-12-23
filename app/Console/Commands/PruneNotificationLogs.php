<?php

namespace App\Console\Commands;

use App\Models\NotificationLog;
use Illuminate\Console\Command;

class PruneNotificationLogs extends Command
{
    protected $signature = 'notifications:prune-logs {--days=90 : Keep logs for X days}';
    protected $description = 'Remove old notification logs (keep only recent ones for auditing)';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $cutoff = now()->subDays($days);

        // Keep read notifications regardless (might be important for users)
        // Only prune unread and failed ones
        $deleted = NotificationLog::where('created_at', '<', $cutoff)
            ->where(function ($query) {
                $query->where('read', true)
                      ->orWhere('success', false);
            })
            ->delete();

        $this->info("Pruned {$deleted} notification logs older than {$days} days");

        return Command::SUCCESS;
    }
}
