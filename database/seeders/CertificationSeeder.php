<?php

namespace Database\Seeders;

use App\Models\Certification;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeder certyfikatów zawodowych dla providerów
 */
class CertificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $providers = User::role('provider')->get();

        $certifications = [
            [
                'name' => 'Mistrzowski konkurs rzemieślników (MKR)',
                'issuer' => 'Cechu Rzemieślników',
                'credential_id' => 'MKR-2023-001',
                'description' => 'Certyfikat mistrzowski dla hydraulików i złotków',
                'issue_date' => '2023-01-15',
                'expiry_date' => '2028-01-15',
            ],
            [
                'name' => 'Kurs obsługi narzędzi elektrycznych',
                'issuer' => 'Instytut Bezpieczeństwa Pracy',
                'credential_id' => 'IBP-2024-045',
                'description' => 'Certyfikat bezpiecznej obsługi wiertarek i szlifierek',
                'issue_date' => '2024-02-20',
                'expiry_date' => '2026-02-20',
            ],
            [
                'name' => 'Kurs First Aid i BHP',
                'issuer' => 'Polska Organizacja Pierwszej Pomocy',
                'credential_id' => 'POPP-2024-123',
                'description' => 'Zaświadczenie umiejętności udzielania pierwszej pomocy',
                'issue_date' => '2023-06-10',
                'expiry_date' => '2025-06-10',
            ],
            [
                'name' => 'Certyfikat usług sprzątania eko',
                'issuer' => 'Stowarzyszenie Zielone Czyste Miasta',
                'credential_id' => 'SZCM-2023-089',
                'description' => 'Stosowanie środków ekologicznych w sprzątaniu',
                'issue_date' => '2023-03-01',
                'expiry_date' => '2026-03-01',
            ],
            [
                'name' => 'Kurs obsługi rozrabiającego',
                'issuer' => 'Stowarzyszenie Nauczycieli Matematyki',
                'credential_id' => 'SNM-2024-234',
                'description' => 'Certyfikat korepetytora matematyki',
                'issue_date' => '2024-01-10',
                'expiry_date' => null, // Brak wygaśnięcia
            ],
            [
                'name' => 'Certyfikat opiekuna osób starszych',
                'issuer' => 'Uniwersytet Medyczny w Warszawie',
                'credential_id' => 'UMSAW-2023-556',
                'description' => 'Kwalifikacje dla opiekunów osób starszych i niepełnosprawnych',
                'issue_date' => '2023-09-15',
                'expiry_date' => '2026-09-15',
            ],
        ];

        foreach ($providers as $provider) {
            // 60% providerów ma 1-3 certyfikaty
            if (rand(1, 100) <= 60) {
                $count = rand(1, 3);
                $selected = collect($certifications)->random($count);

                foreach ($selected as $cert) {
                    Certification::create([
                        'user_id' => $provider->id,
                        'name' => $cert['name'],
                        'issuer' => $cert['issuer'],
                        'credential_id' => $cert['credential_id'] . '-' . $provider->id,
                        'description' => $cert['description'],
                        'issue_date' => $cert['issue_date'],
                        'expiry_date' => $cert['expiry_date'],
                        'document_path' => 'certifications/' . strtolower(str_replace(' ', '-', $cert['name'])) . '.pdf',
                        'credential_url' => 'https://example.com/verify/' . $cert['credential_id'],
                        'is_active' => true,
                        'is_verified' => rand(1, 100) <= 80, // 80% zweryfikowanych
                    ]);
                }
            }
        }

        $this->command->info('Certyfikaty: ' . Certification::count() . ' utworzono');
    }
}
