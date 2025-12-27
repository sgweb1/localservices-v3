<?php

namespace Tests\Feature\Booking;

use App\Models\Booking;
use App\Models\Conversation;
use App\Models\Location;
use App\Models\Message;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use App\Models\ProviderProfile;
use App\Enums\UserType;
use App\Enums\BookingStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * SC-002: Scenariusz podróży dostawcy - obsługa rezerwacji
 * 
 * Kroki:
 * 1. Provider otrzymuje powiadomienie o nowej rezerwacji
 * 2. Provider przegląda szczegóły rezerwacji
 * 3. Provider akceptuje/odrzuca rezerwację lub wysyła cytat
 * 4. Provider kontaktuje się z klientem (czat)
 * 5. Provider potwierdza ukończenie usługi
 * 6. Przegląd rezerwacji i analytics
 * 
 * @group booking
 * @group provider-journey
 */
class ProviderBookingWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected User $customer;
    protected User $provider;
    protected Location $warsaw;
    protected ServiceCategory $plumbing;
    protected Service $instantService;
    protected Service $requestService;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Setup lokalizacja
        $this->warsaw = Location::factory()->create([
            'name' => 'Warszawa',
            'slug' => 'warszawa',
        ]);

        // Setup kategoria
        $this->plumbing = ServiceCategory::factory()->create([
            'name' => 'Hydraulika',
            'slug' => 'hydraulika',
        ]);

        // Setup provider
        $this->provider = User::factory()->provider()->create([
            'name' => 'Jan Kowalski - Hydraulik',
            'email' => 'jan.kowalski@example.com',
            'phone' => '+48123456789',
        ]);

        ProviderProfile::factory()->create([
            'user_id' => $this->provider->id,
            'trust_score' => 92,
            'verification_level' => 5,
            'response_time_hours' => 15,
            'completion_rate' => 98.5,
        ]);

        // Setup usługi
        $this->instantService = Service::factory()->create([
            'provider_id' => $this->provider->id,
            'location_id' => $this->warsaw->id,
            'category_id' => $this->plumbing->id,
            'title' => 'Wymiana baterii kuchni',
            'base_price' => 150,
            'instant_booking' => true,
            'status' => 'active',
        ]);

        $this->requestService = Service::factory()->create([
            'provider_id' => $this->provider->id,
            'location_id' => $this->warsaw->id,
            'category_id' => $this->plumbing->id,
            'title' => 'Naprawa pralki',
            'base_price' => 250,
            'instant_booking' => false,
            'status' => 'active',
        ]);

        // Setup customer
        $this->customer = User::factory()->customer()->create([
            'name' => 'Anna Nowak',
            'email' => 'anna.nowak@example.com',
            'phone' => '+48987654321',
        ]);
    }

    /**
     * Krok 1: Provider otrzymuje powiadomienie o nowej rezerwacji
     * 
     * Gdy klient rezerwuje usługę (instant), provider powinien otrzymać powiadomienie
     * i rezerwacja powinna być widoczna na liście
     */
    public function test_provider_receives_notification_on_new_booking(): void
    {
        // Klient rezerwuje usługę instant booking
        $booking = Booking::factory()->create([
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->instantService->id,
            'status' => BookingStatus::CONFIRMED->value,
            'booking_date' => now()->addDays(2),
            'start_time' => '10:00',
        ]);

        // Provider powinien mieć dostęp do rezerwacji
        $response = $this->actingAs($this->provider)
            ->getJson('/api/v1/provider/bookings');

        $response->assertStatus(200);
        
        $bookings = $response->json('data');
        $this->assertNotEmpty($bookings);

        $bookingIds = collect($bookings)->pluck('id');
        $this->assertTrue($bookingIds->contains($booking->id));
    }

    /**
     * Krok 2: Provider przegląda szczegóły rezerwacji
     * 
     * Provider powinien móc zobaczyć wszystkie detale rezerwacji klienta
     */
    public function test_provider_can_view_booking_details(): void
    {
        $booking = Booking::factory()->create([
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->instantService->id,
            'status' => BookingStatus::CONFIRMED->value,
            'booking_date' => now()->addDays(2),
            'start_time' => '10:00',
            'customer_notes' => 'Proszę przyjechać sprzętem do spawania',
        ]);

        $response = $this->actingAs($this->provider)
            ->getJson('/api/v1/provider/bookings/' . $booking->id);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'id',
                'status',
                'customer' => [
                    'id',
                    'name',
                    'phone',
                    'email',
                    'address',
                ],
                'service' => [
                    'id',
                    'title',
                    'base_price',
                ],
                'booking_date',
                'start_time',
                'created_at',
            ],
        ]);

        $data = $response->json('data');
        $this->assertEquals($booking->id, $data['id']);
        $this->assertEquals($this->customer->name, $data['customer']['name']);
        $this->assertEquals($this->instantService->title, $data['service']['title']);
    }

    /**
     * Krok 3a: Provider akceptuje rezerwację
     * 
     * Provider potwierdza realizację usługi
     * Status zmienia się na "confirmed" jeśli było "pending_provider_response"
     */
    public function test_provider_can_accept_booking_request(): void
    {
        $booking = Booking::factory()->create([
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->requestService->id,
            'status' => BookingStatus::PENDING->value,
        ]);

        $response = $this->actingAs($this->provider)
            ->postJson('/api/v1/provider/bookings/' . $booking->id . '/accept', [
                'message' => 'Doskonale! Mogę przyjechać na tę datę. Proszę przygotować dostęp do pralki.',
            ]);

        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertEquals(BookingStatus::CONFIRMED->value, $data['status']);

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => BookingStatus::CONFIRMED->value,
        ]);
    }

    /**
     * Krok 3b: Provider odrzuca rezerwację
     * 
     * Provider może odrzucić rezerwację z powodu niedostępności
     */
    public function test_provider_can_decline_booking(): void
    {
        $booking = Booking::factory()->create([
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->requestService->id,
            'status' => BookingStatus::PENDING->value,
        ]);

        $response = $this->actingAs($this->provider)
            ->postJson('/api/v1/provider/bookings/' . $booking->id . '/decline', [
                'reason' => 'Niestety jestem zajęty w tamtym dniu',
            ]);

        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertEquals(BookingStatus::CANCELLED->value, $data['status']);

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => BookingStatus::CANCELLED->value,
        ]);
    }

    /**
     * Krok 3c: Provider wysyła cytat
     * 
     * Provider może wysłać cytat z różną ceną lub modyfikacjami
     */
    public function test_provider_can_send_quote(): void
    {
        $booking = Booking::factory()->create([
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->requestService->id,
            'status' => BookingStatus::PENDING->value,
        ]);

        $response = $this->actingAs($this->provider)
            ->postJson('/api/v1/provider/bookings/' . $booking->id . '/send-quote', [
                'price' => 320,
                'duration_hours' => 2,
                'description' => 'Wymiana części oraz testy urządzenia',
            ]);

        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertEquals(BookingStatus::QUOTE_SENT->value, $data['status']);
        $this->assertEquals(320, $data['total_price']);

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => BookingStatus::QUOTE_SENT->value,
            'total_price' => 320,
        ]);
    }

    /**
     * Krok 4: Provider kontaktuje się z klientem (czat)
     * 
     * Provider powinien móc wysyłać wiadomości do klienta
     */
    public function test_provider_can_chat_with_customer(): void
    {
        $booking = Booking::factory()->create([
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->instantService->id,
            'status' => BookingStatus::CONFIRMED->value,
        ]);

        // Pobranie lub utworzenie konwersacji
        $response = $this->actingAs($this->provider)
            ->postJson('/api/v1/conversations', [
                'participant_id' => $this->customer->id,
                'booking_id' => $booking->id,
            ]);

        $response->assertStatus(200) || $response->assertStatus(201);
        $conversation = $response->json('data');
        $conversationId = $conversation['id'];

        // Wysłanie wiadomości
        $messageResponse = $this->actingAs($this->provider)
            ->postJson('/api/v1/conversations/' . $conversationId . '/messages', [
                'body' => 'Hej! Będę u ciebie o 10:00 rano. Mieszkasz na parterze?',
            ]);

        $messageResponse->assertStatus(201);
        $message = $messageResponse->json('data');
        
        $this->assertEquals('Hej! Będę u ciebie o 10:00 rano. Mieszkasz na parterze?', $message['body']);
        $this->assertEquals($this->provider->id, $message['sender_id']);

        // Weryfikacja w bazie
        $this->assertDatabaseHas('messages', [
            'conversation_id' => $conversationId,
            'sender_id' => $this->provider->id,
            'receiver_id' => $this->customer->id,
            'body' => 'Hej! Będę u ciebie o 10:00 rano. Mieszkasz na parterze?',
        ]);
    }

    /**
     * Krok 4: Provider powinien móc czytać wiadomości od klienta
     */
    public function test_provider_can_read_customer_messages(): void
    {
        // Tworzymy konwersację z wiadomościami
        $conversation = Conversation::factory()->create([
            'user_one_id' => $this->provider->id,
            'user_two_id' => $this->customer->id,
        ]);

        Message::factory()->create([
            'conversation_id' => $conversation->id,
            'sender_id' => $this->customer->id,
            'receiver_id' => $this->provider->id,
            'body' => 'Dziękuję za potwierdzenie!',
        ]);

        Message::factory()->create([
            'conversation_id' => $conversation->id,
            'sender_id' => $this->provider->id,
            'receiver_id' => $this->customer->id,
            'body' => 'Nie ma sprawy! Do zobaczenia!',
        ]);

        // Provider pobiera wiadomości
        $response = $this->actingAs($this->provider)
            ->getJson('/api/v1/conversations/' . $conversation->id . '/messages');

        $response->assertStatus(200);
        $messages = $response->json('data');
        
        $this->assertCount(2, $messages);
        $this->assertEquals('Dziękuję za potwierdzenie!', $messages[0]['body']);
    }

    /**
     * Krok 5a: Provider potwierdza dotarcie do lokalizacji
     * 
     * Provider zmienia status na "in_progress" gdy dotarł do klienta
     */
    public function test_provider_can_mark_booking_in_progress(): void
    {
        $booking = Booking::factory()->create([
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->instantService->id,
            'status' => BookingStatus::CONFIRMED->value,
            'booking_date' => now(),
            'start_time' => '10:00',
        ]);

        $response = $this->actingAs($this->provider)
            ->postJson('/api/v1/provider/bookings/' . $booking->id . '/start', [
                'notes' => 'Właśnie przyjechałem na miejsce',
            ]);

        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertEquals(BookingStatus::IN_PROGRESS->value, $data['status']);

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => BookingStatus::IN_PROGRESS->value,
        ]);
    }

    /**
     * Krok 5b: Provider potwierdza ukończenie usługi
     * 
     * Provider zmienia status na "completed" i może dodać notatki
     */
    public function test_provider_can_mark_booking_completed(): void
    {
        $booking = Booking::factory()->create([
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->instantService->id,
            'status' => BookingStatus::IN_PROGRESS->value,
            'booking_date' => now(),
        ]);

        $response = $this->actingAs($this->provider)
            ->postJson('/api/v1/provider/bookings/' . $booking->id . '/complete', [
                'notes' => 'Wymiana wykonana bez problemów. Bateria testowana i działa 100%',
                'final_price' => 150,
            ]);

        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertEquals(BookingStatus::COMPLETED->value, $data['status']);
        $this->assertEquals(150, $data['total_price']);

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => BookingStatus::COMPLETED->value,
            'total_price' => 150,
        ]);
    }

    /**
     * Krok 6: Provider przegląda swoje rezerwacje i analytics
     * 
     * Provider powinien móc zobaczyć listę wszystkich rezerwacji z filtrowaniem po statusie
     */
    public function test_provider_can_filter_bookings_by_status(): void
    {
        // Tworzymy rezerwacje w różnych statusach
        Booking::factory()->create([
            'provider_id' => $this->provider->id,
            'status' => BookingStatus::CONFIRMED->value,
        ]);

        Booking::factory()->create([
            'provider_id' => $this->provider->id,
            'status' => BookingStatus::IN_PROGRESS->value,
        ]);

        Booking::factory()->create([
            'provider_id' => $this->provider->id,
            'status' => BookingStatus::COMPLETED->value,
        ]);

        // Pobierz tylko potwierdzone rezerwacje
        $response = $this->actingAs($this->provider)
            ->getJson('/api/v1/provider/bookings?status=' . BookingStatus::CONFIRMED->value);

        $response->assertStatus(200);
        $bookings = $response->json('data');

        foreach ($bookings as $booking) {
            $this->assertEquals(BookingStatus::CONFIRMED->value, $booking['status']);
        }
    }

    /**
     * Krok 6: Provider przegląda statystyki
     * 
     * Provider powinien móc zobaczyć swoje statystyki (średnia ocen, liczba rezerwacji, itd)
     */
    public function test_provider_can_view_statistics(): void
    {
        // Tworzymy kilka rezerwacji
        Booking::factory()->count(5)->create([
            'provider_id' => $this->provider->id,
            'status' => BookingStatus::COMPLETED->value,
        ]);

        Booking::factory()->create([
            'provider_id' => $this->provider->id,
            'status' => BookingStatus::IN_PROGRESS->value,
        ]);

        Booking::factory()->create([
            'provider_id' => $this->provider->id,
            'status' => BookingStatus::CANCELLED->value,
        ]);

        $response = $this->actingAs($this->provider)
            ->getJson('/api/v1/provider/statistics');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'total_bookings',
                'completed_bookings',
                'pending_bookings',
                'cancelled_bookings',
                'completion_rate',
                'average_rating',
                'trust_score',
                'response_time',
            ],
        ]);

        $stats = $response->json('data');
        $this->assertEquals(7, $stats['total_bookings']);
        $this->assertEquals(5, $stats['completed_bookings']);
    }

    /**
     * Bląd: Provider nie może widzieć rezerwacji innego providera
     */
    public function test_provider_cannot_view_other_providers_bookings(): void
    {
        $otherProvider = User::factory()->provider()->create();

        $booking = Booking::factory()->create([
            'provider_id' => $otherProvider->id,
            'customer_id' => $this->customer->id,
            'service_id' => $this->instantService->id,
        ]);

        $response = $this->actingAs($this->provider)
            ->getJson('/api/v1/provider/bookings/' . $booking->id);

        $response->assertStatus(403);
    }

    /**
     * Bląd: Provider nie może zmienić statusu rezerwacji
     * jeśli obecny status nie pozwala na to
     */
    public function test_provider_cannot_complete_pending_booking(): void
    {
        $booking = Booking::factory()->create([
            'provider_id' => $this->provider->id,
            'customer_id' => $this->customer->id,
            'service_id' => $this->requestService->id,
            'status' => BookingStatus::PENDING->value,
        ]);

        $response = $this->actingAs($this->provider)
            ->postJson('/api/v1/provider/bookings/' . $booking->id . '/complete');

        $response->assertStatus(422);
    }

    /**
     * Bląd: Unauthenticated provider nie ma dostępu
     */
    public function test_unauthenticated_user_cannot_access_provider_bookings(): void
    {
        $response = $this->getJson('/api/v1/provider/bookings');

        $response->assertStatus(401);
    }
}
