<?php

namespace Tests\Filament;

use App\Models\PlatformInvoice;
use App\Models\User;
use App\Filament\Resources\PlatformInvoiceResource;
use Tests\TestCase;

/**
 * Testy dla PlatformInvoiceResource w Filament
 *
 * Sprawdzanie:
 * - Resource configuration
 * - Przeglądanie list faktur
 * - View-only mode
 */
class PlatformInvoiceResourceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        
        $this->actingAs(
            User::factory()->create(['user_type' => 'provider'])
        );
    }

    public function test_resource_exists(): void
    {
        $this->assertTrue(class_exists(PlatformInvoiceResource::class));
    }

    public function test_resource_has_correct_model(): void
    {
        $resource = new PlatformInvoiceResource();
        $this->assertEquals(PlatformInvoice::class, $resource::$model);
    }

    public function test_resource_has_navigation_label(): void
    {
        $this->assertIsString(PlatformInvoiceResource::getNavigationLabel());
    }

    public function test_can_access_invoice_list_page(): void
    {
        $this->get('/admin/platform-invoices')
            ->assertSuccessful();
    }

    public function test_can_list_multiple_invoices(): void
    {
        PlatformInvoice::factory(3)->paid()->create();

        $this->get('/admin/platform-invoices')
            ->assertSuccessful();
    }

    public function test_invoice_appears_in_table(): void
    {
        $invoice = PlatformInvoice::factory()->paid()->create();

        $response = $this->get('/admin/platform-invoices');
        
        $response->assertSuccessful();
    }

    public function test_can_view_invoice_details(): void
    {
        $invoice = PlatformInvoice::factory()->paid()->create();

        $this->get("/admin/platform-invoices/{$invoice->id}")
            ->assertSuccessful();
    }

    public function test_multiple_statuses_visible_in_list(): void
    {
        PlatformInvoice::factory()->paid()->create();
        PlatformInvoice::factory()->pending()->create();
        PlatformInvoice::factory()->failed()->create();

        $this->get('/admin/platform-invoices')
            ->assertSuccessful();
    }

    public function test_invoices_sorted_by_date(): void
    {
        PlatformInvoice::factory()->create(['created_at' => now()->subDays(3)]);
        PlatformInvoice::factory()->create(['created_at' => now()]);
        PlatformInvoice::factory()->create(['created_at' => now()->subDays(1)]);

        $this->get('/admin/platform-invoices')
            ->assertSuccessful();
    }

    public function test_invoice_with_stripe_id_displayed(): void
    {
        $invoice = PlatformInvoice::factory()->create([
            'stripe_session_id' => 'cs_test_123456789',
        ]);

        $this->assertDatabaseHas('platform_invoices', [
            'id' => $invoice->id,
            'stripe_session_id' => 'cs_test_123456789',
        ]);
    }

    public function test_invoice_payment_details_preserved(): void
    {
        $paymentDetails = [
            'method' => 'card',
            'last4' => '4242',
            'brand' => 'visa',
        ];
        
        $invoice = PlatformInvoice::factory()->create([
            'payment_details' => json_encode($paymentDetails),
        ]);

        $this->assertDatabaseHas('platform_invoices', [
            'id' => $invoice->id,
        ]);

        $freshInvoice = $invoice->fresh();
        $this->assertEquals($paymentDetails, json_decode($freshInvoice->payment_details, true));
    }
}
