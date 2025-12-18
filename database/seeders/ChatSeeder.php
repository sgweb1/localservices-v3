<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeder dla systemu czatu
 * 
 * Tworzy rozmowy między customerami a providerami
 * oraz przykładowe wiadomości
 */
class ChatSeeder extends Seeder
{
    public function run(): void
    {
        $customers = User::role('customer')->get();
        $providers = User::role('provider')->get();
        $bookings = Booking::with('customer', 'provider')->get();

        if ($customers->isEmpty() || $providers->isEmpty()) {
            $this->command->warn('⚠ Brak użytkowników.');
            return;
        }

        $this->command->info('🔄 Tworzenie rozmów...');
        $conversations = 0;
        $messages = 0;

        // Rozmowy powiązane z bookings
        foreach ($bookings->random(min(3, $bookings->count())) as $booking) {
            $conv = Conversation::create([
                'customer_id' => $booking->customer_id,
                'provider_id' => $booking->provider_id,
                'booking_id' => $booking->id,
                'service_id' => $booking->service_id,
                'subject' => 'Rezerwacja: ' . $booking->booking_number,
            ]);
            $conversations++;

            // Dodaj kilka wiadomości
            $messageCount = rand(2, 5);
            for ($i = 0; $i < $messageCount; $i++) {
                $sender = $i % 2 === 0 ? $booking->customer : $booking->provider;
                Message::create([
                    'conversation_id' => $conv->id,
                    'sender_id' => $sender->id,
                    'body' => $this->getRandomMessage(),
                    'read_at' => rand(0, 100) > 30 ? now()->subHours(rand(1, 24)) : null,
                ]);
                $messages++;
            }
        }

        // Rozmowy bez powiązania z booking (zapytania o usługę)
        for ($i = 0; $i < 2; $i++) {
            $customer = $customers->random();
            $provider = $providers->random();

            // Sprawdź czy już istnieje rozmowa
            $existing = Conversation::where('customer_id', $customer->id)
                ->where('provider_id', $provider->id)
                ->exists();

            if ($existing) continue;

            $conv = Conversation::create([
                'customer_id' => $customer->id,
                'provider_id' => $provider->id,
                'subject' => 'Zapytanie o usługę',
            ]);
            $conversations++;

            // 3-4 wiadomości
            for ($j = 0; $j < rand(3, 4); $j++) {
                $sender = $j % 2 === 0 ? $customer : $provider;
                Message::create([
                    'conversation_id' => $conv->id,
                    'sender_id' => $sender->id,
                    'body' => $this->getRandomServiceMessage($j % 2 === 0),
                ]);
                $messages++;
            }
        }

        $this->command->info("✅ Rozmowy: {$conversations} utworzono");
        $this->command->info("✅ Wiadomości: {$messages} utworzono");
    }

    private function getRandomMessage(): string
    {
        $messages = [
            'Dzień dobry, czy rezerwacja jest nadal aktualna?',
            'Tak, czekamy na Was w umówionym terminie.',
            'Czy mogę prosić o potwierdzenie godziny?',
            'Potwierdzam - czwartek 10:00. Do zobaczenia!',
            'Będziemy gotowi, dziękuję.',
            'Proszę pamiętać o wszystkim z oferty.',
            'Oczywiście, standardowa procedura.',
            'Doskonale, do zobaczenia.',
            'Czy będą jakieś problemy?',
            'Wszystko będzie OK, nie martwić się.',
        ];

        return $messages[array_rand($messages)];
    }

    private function getRandomServiceMessage($isCustomer): string
    {
        if ($isCustomer) {
            return [
                'Dzień dobry, czy świadczysz usługę naprawy hydrauliki?',
                'Ile czasu zajmuje diagnoza?',
                'Jakie są wasze ceny?',
                'Czy możesz przyjść dzisiaj?',
            ][rand(0, 3)];
        }

        return [
            'Tak, świadczę tego typu usługi.',
            'Diagnoza zajmuje zazwyczaj 1-2 godziny.',
            'Ceny są dostępne w mojej ofercie.',
            'Mogę przyjść jutro rano, jest OK?',
        ][rand(0, 3)];
    }
}
