<?php

namespace Database\Seeders;

use App\Models\PortfolioComment;
use App\Models\PortfolioItem;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeder komentarzy do portfolio
 */
class PortfolioCommentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $portfolioItems = PortfolioItem::where('is_visible', true)->get();
        $customers = User::role('customer')->get();

        $comments = [
            'Świetna robota! Bardzo zadowolony z efektów pracy.',
            'Profesjonalnie, szybko, tanio. Polecam!',
            'Dokładnie takiego efektu oczekiwałem. Dziękuję!',
            'Bardzo dobra jakość usługi. Godny polecenia.',
            'Wykonane bez najmniejszych niedostatków.',
            'Pracownik wysoko wykwalifikowany, solidny.',
            'Super wykonanie. Zawsze sprawdzę najpierw jego portfolio.',
            'Idealny rezultat. Wrócę do niego za rok.',
            'Polecę znajomym i rodzinie. Naprawdę wart swojej ceny.',
            'Zachwycony jakością. Tyle talent!',
        ];

        foreach ($portfolioItems as $item) {
            // 50% portfolio items ma 0-4 komentarze
            if (rand(1, 100) <= 50) {
                $count = rand(0, 4);
                for ($i = 0; $i < $count; $i++) {
                    PortfolioComment::create([
                        'portfolio_item_id' => $item->id,
                        'user_id' => $customers->random()->id,
                        'comment' => $comments[array_rand($comments)],
                        'rating' => rand(4, 5), // Głównie 4-5 gwiazdek
                        'is_approved' => rand(1, 100) <= 95, // 95% zatwierdzonych
                    ]);
                }
            }
        }

        $this->command->info('Komentarze: ' . PortfolioComment::count() . ' utworzono');
    }
}
