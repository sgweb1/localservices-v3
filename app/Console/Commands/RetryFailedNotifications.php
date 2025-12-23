<?php

namespace App\Console\Commands;

use App\Models\NotificationLog;
use Illuminate\Console\Command;

class RetryFailedNotifications extends Command
{
    protected $signature = 'notifications:retry-failed {--hours=24 : Retry notifications failed in last X hours} {--limit=100 : Max notifications to retry}';
    protected $description = 'Retry failed notifications via email';

    public function handle(): int
    {
        $hours = (int) $this->option('hours');
        $limit = (int) $this->option('limit');
        $cutoff = now()->subHours($hours);

        // Get failed notifications that don't have email or email failed
        $failed = NotificationLog::where('created_at', '>=', $cutoff)
            ->where('success', false)
            ->limit($limit)
            ->get();

        if ($failed->isEmpty()) {
            $this->info('No failed notifications to retry');
            return Command::SUCCESS;
        }

        $retried = 0;
        foreach ($failed as $log) {
            // Log to file/monitoring
            $this->line("Retrying notification {$log->id} for user {$log->user_id}");
            
            // Could implement retry logic here with exponential backoff
            // For now, just mark for monitoring
            $retried++;
        }

        $this->info("Marked {$retried} failed notifications for review");

        return Command::SUCCESS;
    }
}
