<?php

namespace Database\Seeders;

use App\Models\ProfileView;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ProfileViewSeeder extends Seeder
{
    /**
     * Seed przykładowych wyświetleń profilu dla testowania analytics
     */
    public function run(): void
    {
        // Znajdź providera
        $provider = User::whereHas('roles', function ($q) {
            $q->where('name', 'provider');
        })->first();

        if (!$provider) {
            $this->command->warn('Brak providerów w bazie - pomijam seeding profile_views');
            return;
        }

        $sources = ['search', 'google_ads', 'social_media', 'direct', 'referral'];
        $weights = [40, 25, 15, 15, 5]; // % dla każdego źródła

        // Generuj views dla ostatnich 30 dni
        $startDate = Carbon::now()->subDays(30);
        $endDate = Carbon::now();

        $totalViews = rand(800, 1500);

        for ($i = 0; $i < $totalViews; $i++) {
            // Losowa data w okresie
            $viewedAt = Carbon::createFromTimestamp(
                rand($startDate->timestamp, $endDate->timestamp)
            );

            // Wybierz źródło z wagami
            $rand = rand(1, 100);
            $cumulative = 0;
            $source = 'direct';

            foreach ($sources as $index => $s) {
                $cumulative += $weights[$index];
                if ($rand <= $cumulative) {
                    $source = $s;
                    break;
                }
            }

            // Referrer based on source
            $referrer = match($source) {
                'search' => 'https://www.google.com/search?q=hydraulik',
                'google_ads' => 'https://www.google.com/ads',
                'social_media' => collect(['https://facebook.com', 'https://instagram.com'])->random(),
                'referral' => 'https://example.com',
                default => null,
            };

            ProfileView::create([
                'provider_id' => $provider->id,
                'viewer_id' => rand(0, 10) > 7 ? null : User::inRandomOrder()->first()?->id,
                'source' => $source,
                'referrer' => $referrer,
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
                'ip_address' => implode('.', [rand(1, 255), rand(1, 255), rand(1, 255), rand(1, 255)]),
                'viewed_at' => $viewedAt,
            ]);
        }

        $this->command->info("Wygenerowano {$totalViews} wyświetleń profilu dla providera #{$provider->id}");
    }
}
