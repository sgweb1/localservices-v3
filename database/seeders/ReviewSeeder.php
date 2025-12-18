<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Review;
use App\Models\ReviewResponse;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeder opinii/recenzji
 * 
 * Tworzy recenzje dla completed bookings
 * oraz odpowiedzi providerów na recenzje
 */
class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $completedBookings = Booking::where('status', 'completed')
            ->with('customer', 'provider')
            ->get();

        if ($completedBookings->isEmpty()) {
            $this->command->warn('⚠ Brak completed bookings. Uruchom BookingSeeder.');
            return;
        }

        $this->command->info('🔄 Tworzenie recenzji...');
        $created = 0;
        $responses = 0;

        foreach ($completedBookings as $booking) {
            // 70% bookings ma recenzję od klienta
            if (rand(1, 100) <= 70) {
                $review = $this->createCustomerReview($booking);
                $created++;

                // 40% recenzji ma odpowiedź providera
                if (rand(1, 100) <= 40) {
                    $this->createProviderResponse($review);
                    $responses++;
                }
            }

            // 30% bookings ma recenzję od providera (on ocenia klienta)
            if (rand(1, 100) <= 30) {
                $this->createProviderReview($booking);
                $created++;
            }
        }

        $this->command->info("✅ Recenzje: {$created} utworzono");
        $this->command->info("✅ Odpowiedzi: {$responses} utworzono");
    }

    private function createCustomerReview($booking): Review
    {
        $ratings = [5, 5, 5, 4, 4, 4, 3, 2]; // 70% wysoko ocenianych

        $review = Review::create([
            'booking_id' => $booking->id,
            'reviewer_id' => $booking->customer_id,
            'reviewed_id' => $booking->provider_id,
            'rating' => $ratings[array_rand($ratings)],
            'comment' => $this->getRandomCustomerComment(),
            'categories' => [
                'communication' => rand(3, 5),
                'punctuality' => rand(3, 5),
                'cleanliness' => rand(3, 5),
                'professionalism' => rand(3, 5),
            ],
            'is_visible' => rand(1, 100) > 5, // 95% widoczne
            'is_reported' => rand(1, 100) > 95, // 5% zgłaszane
        ]);

        return $review;
    }

    private function createProviderReview($booking): Review
    {
        return Review::create([
            'booking_id' => $booking->id,
            'reviewer_id' => $booking->provider_id,
            'reviewed_id' => $booking->customer_id,
            'rating' => rand(4, 5), // Providery zazwyczaj oceniają wysoko
            'comment' => 'Miła i punktualna osoba. Polecam!',
            'is_visible' => true,
        ]);
    }

    private function createProviderResponse($review): void
    {
        ReviewResponse::create([
            'review_id' => $review->id,
            'user_id' => $review->reviewed_id, // Provider odpowiada
            'response' => $this->getRandomProviderResponse(),
        ]);
    }

    private function getRandomCustomerComment(): string
    {
        $comments = [
            'Doskonała usługa! Bardzo profesjonalnie wykonana. Polecam!',
            'Wszystko przebiegło bez problemów. Dziękuję!',
            'Szybko, sprawnie i tanio. Super!',
            'Niezła robota, trochę czasu zajęło ale efekt zadowalający.',
            'Mogło być lepiej, ale ogólnie OK.',
            'Nie najgorzej ale spodziewałem się więcej.',
            'Średnio. Kilka rzeczy mogłoby być lepiej.',
            'Niestety nie spełniło moich oczekiwań.',
            'Rozczarowujące. Nie polecam.',
        ];

        return $comments[array_rand($comments)];
    }

    private function getRandomProviderResponse(): string
    {
        $responses = [
            'Dziękujemy za opinię! Cieszą nas słowa pochwały. Zapraszamy ponownie!',
            'Dziękuję za zaufanie. Będę się starał jeszcze lepiej!',
            'Dziękuję! Jesteśmy dostępni w każdym momencie.',
            'Dziękuję za feedback! Bierzemy go pod uwagę.',
            'Przepraszamy za trudności. Będziemy pracować nad poprawą!',
            'Rozumiemy Waszą opinię. Postaramy się następnym razem!',
        ];

        return $responses[array_rand($responses)];
    }
}
