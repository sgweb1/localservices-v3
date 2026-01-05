<?php

namespace Tests\Feature\Api\V1;

use App\Enums\BookingStatus;
use App\Enums\UserType;
use App\Models\Booking;
use App\Models\CustomerProfile;
use App\Models\ProviderProfile;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Tests\TestCase;

/**
 * Test Suite for BookingController (Consolidated)
 * 
 * Pokrycie po konsolidacji BookingController + ProviderBookingController:
 * - CRUD operations (index, show, store)
 * - Provider actions (accept, reject, complete, sendQuote, start)
 * - Customer actions (cancel, confirm)
 * - Statistics endpoint
 * - Soft delete (destroy/restore with hidden_by_provider)
 * - CompleteOverdue automation
 * 
 * @group bookings
 * @group api
 */
class BookingControllerTest extends TestCase
{
    use RefreshDatabase, WithoutMiddleware;

    protected User $provider;
    protected User $customer;
    protected Service $service;
    protected ProviderProfile $providerProfile;
    protected CustomerProfile $customerProfile;

    protected function setUp(): void
    {
        parent::setUp();

        // Create provider with profile
        $this->provider = User::factory()->create([
            'user_type' => UserType::Provider,
            'email' => 'provider@test.com',
        ]);
        $this->providerProfile = ProviderProfile::factory()->create([
            'user_id' => $this->provider->id,
        ]);

        // Create customer with profile
        $this->customer = User::factory()->create([
            'user_type' => UserType::Customer,
            'email' => 'customer@test.com',
        ]);
        $this->customerProfile = CustomerProfile::factory()->create([
            'user_id' => $this->customer->id,
        ]);

        // Create service
        $this->service = Service::factory()->create([
            'provider_id' => $this->provider->id,
        ]);
    }

    /**
     * Test: Unauthenticated user cannot access bookings
     */
    public function test_unauthenticated_user_cannot_access_bookings(): void
    {
        $response = $this->getJson('/api/v1/bookings');

        $response->assertStatus(401);
    }

    /**
     * Test: Provider can list their bookings
     */
    public function test_provider_can_list_their_bookings(): void
    {
        // Create bookings for this provider
        Booking::factory()->count(5)->create([
            'provider_id' => $this->provider->id,
            'customer_id' => $this->customer->id,
            'service_id' => $this->service->id,
        ]);

        // Create bookings for other provider (should not appear)
        $otherProvider = User::factory()->create(['user_type' => UserType::Provider]);
        Booking::factory()->count(3)->create([
            'provider_id' => $otherProvider->id,
            'customer_id' => $this->customer->id,
        ]);

        $response = $this->actingAs($this->provider)
            ->getJson('/api/v1/provider/bookings');

        $response->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'status', 'booking_date', 'customer', 'service'],
                ],
                'meta' => ['current_page', 'total'],
            ]);
    }

    /**
     * Test: Provider can filter bookings by status
     */
    public function test_provider_can_filter_bookings_by_status(): void
    {
        Booking::factory()->count(3)->create([
            'provider_id' => $this->provider->id,
            'customer_id' => $this->customer->id,
            'status' => 'pending',
        ]);

        Booking::factory()->count(2)->create([
            'provider_id' => $this->provider->id,
            'customer_id' => $this->customer->id,
            'status' => 'confirmed',
        ]);

        $response = $this->actingAs($this->provider)
            ->getJson('/api/v1/provider/bookings?status=confirmed');

        $response->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.total', 2);
    }

    /**
     * Test: Provider can view single booking
     */
    public function test_provider_can_view_single_booking(): void
    {
        $booking = Booking::factory()->create([
            'provider_id' => $this->provider->id,
            'customer_id' => $this->customer->id,
            'service_id' => $this->service->id,
        ]);

        $response = $this->actingAs($this->provider)
            ->getJson("/api/v1/provider/bookings/{$booking->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $booking->id)
            ->assertJsonStructure([
                'data' => ['id', 'status', 'customer', 'service', 'provider'],
            ]);
    }

    /**
     * Test: Provider cannot view booking of another provider
     */
    public function test_provider_cannot_view_other_provider_booking(): void
    {
        $otherProvider = User::factory()->create(['user_type' => UserType::Provider]);
        $booking = Booking::factory()->create([
            'provider_id' => $otherProvider->id,
            'customer_id' => $this->customer->id,
        ]);

        $response = $this->actingAs($this->provider)
            ->getJson("/api/v1/provider/bookings/{$booking->id}");

        $response->assertNotFound();
    }

    /**
     * Test: Customer can create booking
     */
    public function test_customer_can_create_booking(): void
    {
        $data = [
            'service_id' => $this->service->id,
            'provider_id' => $this->provider->id,
            'booking_date' => now()->addDays(3)->format('Y-m-d'),
            'start_time' => '10:00',
            'duration_minutes' => 120,
            'notes' => 'Test booking',
        ];

        $response = $this->actingAs($this->customer)
            ->postJson('/api/v1/bookings', $data);

        $response->assertCreated()
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.customer.id', $this->customer->id)
            ->assertJsonPath('data.provider.id', $this->provider->id);

        $this->assertDatabaseHas('bookings', [
            'customer_id' => $this->customer->id,
            'provider_id' => $this->provider->id,
            'status' => 'pending',
        ]);
    }

    /**
     * Test: Customer cannot book with themselves (self-booking prevention)
     */
    public function test_customer_cannot_self_book(): void
    {
        $customerService = Service::factory()->create([
            'provider_id' => $this->customer->id,
        ]);

        $data = [
            'service_id' => $customerService->id,
            'provider_id' => $this->customer->id,
            'booking_date' => now()->addDays(3)->format('Y-m-d'),
            'start_time' => '10:00',
        ];

        $response = $this->actingAs($this->customer)
            ->postJson('/api/v1/bookings', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('provider_id');
    }

    /**
     * Test: Provider can accept booking
     */
    public function test_provider_can_accept_booking(): void
    {
        $booking = Booking::factory()->create([
            'provider_id' => $this->provider->id,
            'customer_id' => $this->customer->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->provider)
            ->postJson("/api/v1/provider/bookings/{$booking->id}/accept");

        $response->assertOk()
            ->assertJsonPath('data.status', 'confirmed');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'confirmed',
        ]);
    }

    /**
     * Test: Provider can reject booking
     */
    public function test_provider_can_reject_booking(): void
    {
        $booking = Booking::factory()->create([
            'provider_id' => $this->provider->id,
            'customer_id' => $this->customer->id,
            'status' => 'pending',
        ]);

        $data = ['reason' => 'Fully booked'];

        $response = $this->actingAs($this->provider)
            ->postJson("/api/v1/provider/bookings/{$booking->id}/decline", $data);

        $response->assertOk()
            ->assertJsonPath('data.status', 'rejected');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'rejected',
        ]);
    }

    /**
     * Test: Provider can send quote
     */
    public function test_provider_can_send_quote(): void
    {
        $booking = Booking::factory()->create([
            'provider_id' => $this->provider->id,
            'customer_id' => $this->customer->id,
            'status' => 'pending',
        ]);

        $data = [
            'price' => 250.00,
            'duration_hours' => 2.5,
            'description' => 'Updated price quote',
        ];

        $response = $this->actingAs($this->provider)
            ->postJson("/api/v1/provider/bookings/{$booking->id}/send-quote", $data);

        $response->assertOk()
            ->assertJsonPath('data.status', 'quote_sent')
            ->assertJsonPath('data.service_price', 250.00);

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'quote_sent',
            'service_price' => 250.00,
        ]);
    }

    /**
     * Test: Provider can start booking
     */
    public function test_provider_can_start_booking(): void
    {
        $booking = Booking::factory()->create([
            'provider_id' => $this->provider->id,
            'customer_id' => $this->customer->id,
            'status' => 'confirmed',
        ]);

        $response = $this->actingAs($this->provider)
            ->postJson("/api/v1/provider/bookings/{$booking->id}/start", [
                'notes' => 'Starting now',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'in_progress');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'in_progress',
        ]);
        $this->assertNotNull($booking->fresh()->started_at);
    }

    /**
     * Test: Provider cannot start non-confirmed booking
     */
    public function test_provider_cannot_start_pending_booking(): void
    {
        $booking = Booking::factory()->create([
            'provider_id' => $this->provider->id,
            'customer_id' => $this->customer->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->provider)
            ->postJson("/api/v1/provider/bookings/{$booking->id}/start");

        $response->assertStatus(422)
            ->assertJsonPath('current_status', 'pending');
    }

    /**
     * Test: Provider can complete booking
     */
    public function test_provider_can_complete_booking(): void
    {
        $booking = Booking::factory()->create([
            'provider_id' => $this->provider->id,
            'customer_id' => $this->customer->id,
            'status' => 'in_progress',
        ]);

        $data = [
            'final_price' => 300.00,
            'notes' => 'Service completed successfully',
        ];

        $response = $this->actingAs($this->provider)
            ->postJson("/api/v1/provider/bookings/{$booking->id}/complete", $data);

        $response->assertOk()
            ->assertJsonPath('data.status', 'completed');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'completed',
            'service_price' => 300.00,
        ]);
        $this->assertNotNull($booking->fresh()->completed_at);
    }

    /**
     * Test: Provider can complete overdue bookings
     */
    public function test_provider_can_complete_overdue_bookings(): void
    {
        // Create confirmed bookings with past dates
        Booking::factory()->count(3)->create([
            'provider_id' => $this->provider->id,
            'customer_id' => $this->customer->id,
            'status' => 'confirmed',
            'booking_date' => now()->subDays(2),
        ]);

        // Create future booking (should not be affected)
        $futureBooking = Booking::factory()->create([
            'provider_id' => $this->provider->id,
            'customer_id' => $this->customer->id,
            'status' => 'confirmed',
            'booking_date' => now()->addDays(2),
        ]);

        $response = $this->actingAs($this->provider)
            ->postJson('/api/v1/provider/bookings/complete-overdue');

        $response->assertOk()
            ->assertJsonPath('count', 3)
            ->assertJsonPath('success', true);

        // Verify overdue bookings are completed
        $this->assertEquals(3, Booking::where('provider_id', $this->provider->id)
            ->where('status', 'completed')
            ->count());

        // Verify future booking is still confirmed
        $this->assertEquals('confirmed', $futureBooking->fresh()->status);
    }

    /**
     * Test: Provider can get statistics
     */
    public function test_provider_can_get_statistics(): void
    {
        // Create various bookings
        Booking::factory()->count(5)->create([
            'provider_id' => $this->provider->id,
            'customer_id' => $this->customer->id,
            'status' => 'completed',
        ]);

        Booking::factory()->count(3)->create([
            'provider_id' => $this->provider->id,
            'customer_id' => $this->customer->id,
            'status' => 'pending',
        ]);

        Booking::factory()->count(2)->create([
            'provider_id' => $this->provider->id,
            'customer_id' => $this->customer->id,
            'status' => 'cancelled',
        ]);

        $response = $this->actingAs($this->provider)
            ->getJson('/api/v1/provider/statistics');

        $response->assertOk()
            ->assertJsonPath('data.total_bookings', 10)
            ->assertJsonPath('data.completed_bookings', 5)
            ->assertJsonPath('data.pending_bookings', 3)
            ->assertJsonPath('data.cancelled_bookings', 2)
            ->assertJsonPath('data.completion_rate', 50.0);
    }

    /**
     * Test: Customer cannot access provider statistics
     */
    public function test_customer_cannot_access_provider_statistics(): void
    {
        $response = $this->actingAs($this->customer)
            ->getJson('/api/v1/provider/statistics');

        $response->assertStatus(403);
    }

    /**
     * Test: Provider can soft-delete booking (hide)
     */
    public function test_provider_can_hide_booking(): void
    {
        $booking = Booking::factory()->create([
            'provider_id' => $this->provider->id,
            'customer_id' => $this->customer->id,
        ]);

        $response = $this->actingAs($this->provider)
            ->deleteJson("/api/v1/provider/bookings/{$booking->id}");

        $response->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'hidden_by_provider' => true,
        ]);
    }

    /**
     * Test: Provider can restore hidden booking
     */
    public function test_provider_can_restore_hidden_booking(): void
    {
        $booking = Booking::factory()->create([
            'provider_id' => $this->provider->id,
            'customer_id' => $this->customer->id,
            'hidden_by_provider' => true,
        ]);

        $response = $this->actingAs($this->provider)
            ->postJson("/api/v1/provider/bookings/{$booking->id}/restore");

        $response->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'hidden_by_provider' => false,
        ]);
    }

    /**
     * Test: Customer can cancel booking
     */
    public function test_customer_can_cancel_booking(): void
    {
        $booking = Booking::factory()->create([
            'provider_id' => $this->provider->id,
            'customer_id' => $this->customer->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->customer)
            ->patchJson("/api/v1/bookings/{$booking->id}/cancel", [
                'reason' => 'Changed plans',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'cancelled');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'cancelled',
        ]);
    }

    /**
     * Test: Hidden bookings are filtered from index
     */
    public function test_hidden_bookings_are_filtered_from_provider_index(): void
    {
        // Visible booking
        Booking::factory()->create([
            'provider_id' => $this->provider->id,
            'customer_id' => $this->customer->id,
            'hidden_by_provider' => false,
        ]);

        // Hidden booking
        Booking::factory()->create([
            'provider_id' => $this->provider->id,
            'customer_id' => $this->customer->id,
            'hidden_by_provider' => true,
        ]);

        $response = $this->actingAs($this->provider)
            ->getJson('/api/v1/provider/bookings');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    /**
     * Test: Provider can see hidden bookings with filter
     */
    public function test_provider_can_see_hidden_bookings_with_filter(): void
    {
        Booking::factory()->count(2)->create([
            'provider_id' => $this->provider->id,
            'customer_id' => $this->customer->id,
            'hidden_by_provider' => false,
        ]);

        Booking::factory()->count(3)->create([
            'provider_id' => $this->provider->id,
            'customer_id' => $this->customer->id,
            'hidden_by_provider' => true,
        ]);

        $response = $this->actingAs($this->provider)
            ->getJson('/api/v1/provider/bookings?hidden=true');

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }
}
