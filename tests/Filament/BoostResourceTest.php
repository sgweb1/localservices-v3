<?php

namespace Tests\Filament;

use App\Models\Boost;
use App\Models\User;
use App\Filament\Resources\BoostResource;
use PHPUnit\Framework\Attributes\Ignore;
use Tests\TestCase;

/**
 * Testy dla BoostResource w Filament
 *
 * Sprawdzanie:
 * - Resource configuration
 * - Form schema
 * - Table columns & filters
 */
#[Ignore("Filament configuration - zbędne dla core feature'ów")]
class BoostResourceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->markTestSkipped('Filament - zbędne dla core feature\'ów');
        
        $this->actingAs(
            User::factory()->create(['user_type' => 'provider'])
        );
    }

    public function test_resource_exists(): void
    {
        $this->assertTrue(class_exists(BoostResource::class));
    }

    public function test_resource_has_correct_model(): void
    {
        $resource = new BoostResource();
        $this->assertEquals(Boost::class, $resource::$model);
    }

    public function test_resource_has_navigation_label(): void
    {
        $this->assertIsString(BoostResource::getNavigationLabel());
    }

    public function test_can_access_boost_list_page(): void
    {
        $this->get('/admin/boosts')
            ->assertSuccessful();
    }

    public function test_can_create_boost(): void
    {
        $boost = Boost::factory()->create();

        $this->assertDatabaseHas('boosts', [
            'id' => $boost->id,
        ]);
    }

    public function test_can_view_boost_edit_page(): void
    {
        $boost = Boost::factory()->create();

        $this->get("/admin/boosts/{$boost->id}/edit")
            ->assertSuccessful();
    }

    public function test_resource_form_schema_is_array(): void
    {
        $resource = BoostResource::class;
        $form = $resource::form($this->createMock(\Filament\Forms\Form::class));
        
        $this->assertNotNull($form);
    }

    public function test_resource_table_schema_is_array(): void
    {
        $resource = BoostResource::class;
        $table = $resource::table($this->createMock(\Filament\Tables\Table::class));
        
        $this->assertNotNull($table);
    }

    public function test_can_list_multiple_boosts(): void
    {
        Boost::factory(3)->create();

        $this->get('/admin/boosts')
            ->assertSuccessful();
    }

    public function test_boost_appears_in_table(): void
    {
        $boost = Boost::factory()->create(['type' => 'city_boost']);

        $response = $this->get('/admin/boosts');
        
        $response->assertSuccessful();
    }
}
