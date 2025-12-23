<?php

namespace App\Console\Commands;

use App\Helpers\MediaHelper;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class MigrateMediaToShardedStructure extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'media:migrate-to-sharded {--dry-run : Pokaż co zostanie zmienione bez wykonywania}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migruje istniejące media do shardowanej struktury katalogów (avatars/xxx/user_id/)';

    protected int $migrated = 0;
    protected int $skipped = 0;
    protected int $errors = 0;

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dryRun = $this->option('dry-run');
        
        if ($dryRun) {
            $this->warn('⚠️  DRY RUN MODE - Żadne pliki nie zostaną przeniesione');
        }

        $this->info('🚀 Migracja mediów do shardowanej struktury');
        $this->newLine();

        // Migruj avatary użytkowników
        $this->migrateAvatars($dryRun);

        $this->newLine();
        $this->info('✅ Migracja zakończona!');
        $this->table(
            ['Status', 'Liczba'],
            [
                ['Zmigrowane', $this->migrated],
                ['Pominięte', $this->skipped],
                ['Błędy', $this->errors],
            ]
        );

        return $this->errors > 0 ? self::FAILURE : self::SUCCESS;
    }

    protected function migrateAvatars(bool $dryRun): void
    {
        $this->info('📸 Migracja avatarów użytkowników...');

        $users = User::whereNotNull('avatar')->get();
        $bar = $this->output->createProgressBar($users->count());
        $bar->start();

        foreach ($users as $user) {
            $bar->advance();

            $oldPath = $user->avatar;
            
            // Skip jeśli już jest w shardowanej strukturze
            if (preg_match('#^avatars/\d{3}/\d+/#', $oldPath)) {
                $this->skipped++;
                continue;
            }

            // Oblicz nową ścieżkę
            $extension = pathinfo($oldPath, PATHINFO_EXTENSION);
            $filename = 'avatar.' . $extension;
            $newPath = MediaHelper::getShardedPath('avatars', $user->id) . '/' . $filename;

            if ($dryRun) {
                $this->newLine();
                $this->line("  User {$user->id}: {$oldPath} → {$newPath}");
                $this->migrated++;
                continue;
            }

            try {
                // Sprawdź czy stary plik istnieje
                if (!Storage::disk('public')->exists($oldPath)) {
                    $this->skipped++;
                    continue;
                }

                // Skopiuj plik do nowej lokalizacji
                $content = Storage::disk('public')->get($oldPath);
                Storage::disk('public')->put($newPath, $content);

                // Zaktualizuj bazę danych
                DB::table('users')
                    ->where('id', $user->id)
                    ->update(['avatar' => $newPath]);

                // Usuń stary plik
                Storage::disk('public')->delete($oldPath);

                // Usuń stary katalog jeśli pusty (np. avatars/old_avatar.jpg)
                $oldDir = dirname($oldPath);
                if ($oldDir !== 'avatars' && Storage::disk('public')->allFiles($oldDir) === []) {
                    Storage::disk('public')->deleteDirectory($oldDir);
                }

                $this->migrated++;
            } catch (\Exception $e) {
                $this->newLine();
                $this->error("  Błąd dla User {$user->id}: {$e->getMessage()}");
                $this->errors++;
            }
        }

        $bar->finish();
        $this->newLine();
    }
}
