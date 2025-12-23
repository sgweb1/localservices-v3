<?php

namespace Database\Factories;

use App\Models\Service;
use App\Models\ServicePhoto;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ServicePhoto>
 */
class ServicePhotoFactory extends Factory
{
    protected $model = ServicePhoto::class;

    public function definition(): array
    {
        return [
            'service_id' => Service::factory(),
            'image_path' => 'services/'.$this->faker->numberBetween(1, 100).'/'.$this->faker->uuid.'.jpg',
            'alt_text' => $this->faker->optional()->sentence(3),
            'is_primary' => false,
            'position' => 1,
        ];
    }
}
