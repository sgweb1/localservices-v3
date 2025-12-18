<?php

namespace Database\Seeders;

use App\Models\ServiceCategory;
use Illuminate\Database\Seeder;

class ServiceCategorySeeder extends Seeder
{
    /**
     * Seed kategorii usług marketplace (polskie nazwy, ikony Heroicons, kolory).
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Hydraulika',
                'slug' => 'hydraulika',
                'description' => 'Usługi hydrauliczne: awarie, instalacje, remonty, przeglądy',
                'icon' => 'heroicon-o-wrench',
                'color' => '#3B82F6',
                'order' => 1,
                'is_active' => true,
                'is_featured' => true,
            ],
            [
                'name' => 'Elektryka',
                'slug' => 'elektryka',
                'description' => 'Usługi elektryczne: instalacje, naprawy, przeglądy, montaż lamp',
                'icon' => 'heroicon-o-bolt',
                'color' => '#F59E0B',
                'order' => 2,
                'is_active' => true,
                'is_featured' => true,
            ],
            [
                'name' => 'Sprzątanie',
                'slug' => 'sprzatanie',
                'description' => 'Sprzątanie mieszkań, domów, biur, sprzątanie po remoncie',
                'icon' => 'heroicon-o-sparkles',
                'color' => '#10B981',
                'order' => 3,
                'is_active' => true,
                'is_featured' => true,
            ],
            [
                'name' => 'Korepetycje',
                'slug' => 'korepetycje',
                'description' => 'Korepetycje szkolne, maturalne, egzaminacyjne, nauczanie języków',
                'icon' => 'heroicon-o-academic-cap',
                'color' => '#8B5CF6',
                'order' => 4,
                'is_active' => true,
                'is_featured' => true,
            ],
            [
                'name' => 'Opieka',
                'slug' => 'opieka',
                'description' => 'Opieka nad dziećmi, osobami starszymi, opieka medyczna',
                'icon' => 'heroicon-o-heart',
                'color' => '#EC4899',
                'order' => 5,
                'is_active' => true,
                'is_featured' => false,
            ],
            [
                'name' => 'Ogrodnictwo',
                'slug' => 'ogrodnictwo',
                'description' => 'Pielęgnacja ogrodów, koszenie trawników, przycinanie drzew',
                'icon' => 'heroicon-o-leaf',
                'color' => '#22C55E',
                'order' => 6,
                'is_active' => true,
                'is_featured' => false,
            ],
            [
                'name' => 'Budowlane',
                'slug' => 'budowlane',
                'description' => 'Usługi remontowe, wykończeniowe, malowanie, gładzie, panele',
                'icon' => 'heroicon-o-home',
                'color' => '#EF4444',
                'order' => 7,
                'is_active' => true,
                'is_featured' => true,
            ],
            [
                'name' => 'IT i Komputery',
                'slug' => 'it-komputery',
                'description' => 'Naprawa komputerów, instalacja oprogramowania, sieci domowe',
                'icon' => 'heroicon-o-computer-desktop',
                'color' => '#6366F1',
                'order' => 8,
                'is_active' => true,
                'is_featured' => false,
            ],
        ];

        foreach ($categories as $category) {
            ServiceCategory::create($category);
        }
    }
}
