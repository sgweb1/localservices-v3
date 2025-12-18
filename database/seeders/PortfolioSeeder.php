<?php

namespace Database\Seeders;

use App\Models\PortfolioItem;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeder portfolio dla providerów
 */
class PortfolioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $providers = User::role('provider')->get();

        $portfolioTemplates = [
            // Hydraulicy
            [
                'title' => 'Modernizacja systemu grzewczego w domu jednorodzinnym',
                'category' => 'hydraulika',
                'description' => 'Pełna wymiana starych rur miedzianych na nowoczesne PEX. Montaż nowego kotła gazowego i wymiennika ciepła.',
                'project_value' => 8500,
                'duration_days' => 5,
            ],
            [
                'title' => 'Remont łazienki - wymiana wyposażenia',
                'category' => 'hydraulika',
                'description' => 'Wymiana starej sanitariatu na nową ceramikę, wanny i prysznice. Ukrycie instalacji w ścianach.',
                'project_value' => 12000,
                'duration_days' => 8,
            ],
            [
                'title' => 'Odkłamanie zalania z pęknięcia rury',
                'category' => 'hydraulika',
                'description' => 'Naprawie pęknięcia w instalacji i suszenie pomieszczeń. Diagnostyka i naprawa przecieków.',
                'project_value' => 2500,
                'duration_days' => 2,
            ],
            // Elektrycy
            [
                'title' => 'Przebudowa instalacji elektrycznej w biurze',
                'category' => 'elektyka',
                'description' => 'Montaż nowych rozdzielnic, okablowanie, instalacja oświetlenia LED i gniazdek sieciowych.',
                'project_value' => 15000,
                'duration_days' => 10,
            ],
            [
                'title' => 'Wymiana starzejącej się instalacji w bloku',
                'category' => 'elektyka',
                'description' => 'Kompleksowa przebudowa instalacji starego bloku mieszkalnego, montaż nowych wyłączników i bezpieczników.',
                'project_value' => 45000,
                'duration_days' => 30,
            ],
            // Sprzątacze
            [
                'title' => 'Sprzątanie po remoncie - 200 m²',
                'category' => 'sprzatanie',
                'description' => 'Profesjonalne sprzątanie biura po pełnym remoncie. Mycie okien, zmycie kurzu, odkurzenie i mycie podłóg.',
                'project_value' => 1800,
                'duration_days' => 2,
            ],
            [
                'title' => 'Czyszczenie tapicerki - 50 mebli',
                'category' => 'sprzatanie',
                'description' => 'Profesjonalne czyszczenie dywanów i tapicerki biurowej przy pomocy specjalistycznego sprzętu.',
                'project_value' => 2200,
                'duration_days' => 1,
            ],
            // Nauczyciele
            [
                'title' => 'Korepetycje matematyki - przygotowanie do matury',
                'category' => 'nauka',
                'description' => 'Przygotowanie 5 studentów do matury z matematyki rozszerzonej. Wyniki: 4 osoby z 80+ pkt.',
                'project_value' => 5000,
                'duration_days' => 120,
            ],
            [
                'title' => 'Lekcje języka angielskiego - poziom zaawansowany',
                'category' => 'nauka',
                'description' => 'Kurs angielskiego dla pracownika korporacji. Zaawansowana komunikacja biznesowa.',
                'project_value' => 3600,
                'duration_days' => 90,
            ],
            // Opiekunowie
            [
                'title' => 'Opieka nad seniorą 24/7 przez 3 miesiące',
                'category' => 'opieka',
                'description' => 'Pełna opieka nad panią w wieku 82 lat. Pomoc w czynnościach codziennych, gotowanie, leki.',
                'project_value' => 18000,
                'duration_days' => 90,
            ],
        ];

        foreach ($providers as $provider) {
            // Każdy provider ma 40% szans na portfolio
            if (rand(1, 100) <= 40) {
                $count = rand(1, 3);
                $selected = collect($portfolioTemplates)->random(min($count, count($portfolioTemplates)));

                foreach ($selected as $template) {
                    PortfolioItem::create([
                        'user_id' => $provider->id,
                        'title' => $template['title'],
                        'category' => $template['category'],
                        'description' => $template['description'],
                        'image_paths' => [
                            'portfolio/' . fake()->bothify('####-##.jpg'),
                            'portfolio/' . fake()->bothify('####-##.jpg'),
                        ],
                        'thumbnail_path' => 'portfolio/thumb-' . fake()->bothify('####.jpg'),
                        'completed_at' => now()->subDays(rand(10, 180)),
                        'project_value' => $template['project_value'],
                        'duration_days' => $template['duration_days'],
                        'views' => rand(10, 500),
                        'likes' => rand(0, 50),
                        'is_visible' => rand(1, 100) <= 85, // 85% widocznych
                        'is_verified' => rand(1, 100) <= 70, // 70% zweryfikowanych
                    ]);
                }
            }
        }

        $this->command->info('Portfolio: ' . PortfolioItem::count() . ' elementów utworzono');
    }
}
