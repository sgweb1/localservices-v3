<?php

namespace Tests\Feature\Api\V1\Booking;

use App\Models\Booking;
use App\Models\CustomerProfile;
use App\Models\ProviderProfile;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_provider_can_view_booking_as_customer(): void
    {
        $provider = User::factory()->provider()->create();
        $provider->profile()->create(UserProfile::factory()->make()->toArray());
        $provider->providerProfile()->create(ProviderProfile::factory()->make()->toArray());

        $otherProvider = User::factory()->provider()->create();

        $booking = Booking::factory()->create([
            'customer_id' => $provider->id, // Provider rezerwuje jako customer
            'provider_id' => $otherProvider->id,
        ]);

        $this->assertTrue($provider->can('view', $booking));
    }

    public function test_provider_can_view_booking_as_provider(): void
    {
        $provider = User::factory()->provider()->create();
        $provider->profile()->create(UserProfile::factory()->make()->toArray());
        $provider->providerProfile()->create(ProviderProfile::factory()->make()->toArray());

        $customer = User::factory()->customer()->create();

        $booking = Booking::factory()->create([
            'customer_id' => $customer->id,
            'provider_id' => $provider->id,
        ]);

        $this->assertTrue($provider->can('view', $booking));
    }

    public function test_user_cannot_view_others_booking(): void
    {
        $user = User::factory()->customer()->create();
        $user->profile()->create(UserProfile::factory()->make()->toArray());
        $user->customerProfile()->create(CustomerProfile::factory()->make()->toArray());

        $booking = Booking::factory()->create(); // Inne osoby

        $this->assertFalse($user->can('view', $booking));
    }

    public function test_customer_can_cancel_booking_with_24h_notice(): void
    {
        $customer = User::factory()->customer()->create();
        $customer->profile()->create(UserProfile::factory()->make()->toArray());
        $customer->customerProfile()->create(CustomerProfile::factory()->make()->toArray());

        $booking = Booking::factory()->create([
            'customer_id' => $customer->id,
            'booking_date' => now()->addDays(2), // 48h w przyszłości
            'status' => 'confirmed',
        ]);

        $this->assertTrue($customer->can('cancel', $booking));
    }

    public function test_customer_cannot_cancel_booking_within_24h(): void
    {
        $customer = User::factory()->customer()->create();
        $customer->profile()->create(UserProfile::factory()->make()->toArray());
        $customer->customerProfile()->create(CustomerProfile::factory()->make()->toArray());

        $booking = Booking::factory()->create([
            'customer_id' => $customer->id,
            'booking_date' => now()->addHours(12), // 12h w przyszłości (< 24h)
            'status' => 'confirmed',
        ]);

        $this->assertFalse($customer->can('cancel', $booking));
    }

    public function test_provider_can_update_booking_status(): void
    {
        $provider = User::factory()->provider()->create();
        $provider->profile()->create(UserProfile::factory()->make()->toArray());
        $provider->providerProfile()->create(ProviderProfile::factory()->make()->toArray());

        $booking = Booking::factory()->create([
            'provider_id' => $provider->id,
        ]);

        $this->assertTrue($provider->can('updateStatus', $booking));
    }

    public function test_customer_cannot_update_provider_status(): void
    {
        $customer = User::factory()->customer()->create();
        $customer->profile()->create(UserProfile::factory()->make()->toArray());
        $customer->customerProfile()->create(CustomerProfile::factory()->make()->toArray());

        $booking = Booking::factory()->create([
            'customer_id' => $customer->id,
        ]);

        $this->assertFalse($customer->can('updateStatus', $booking));
    }
}
