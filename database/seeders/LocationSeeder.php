<?php

namespace Database\Seeders;

use App\Models\Location;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    /**
     * Seed lokalizacji (polskie miasta z prawdziwymi coordinates).
     */
    public function run(): void
    {
        $locations = [
            [
                'name' => 'Warszawa',
                'slug' => 'warszawa',
                'latitude' => 52.2297,
                'longitude' => 21.0122,
                'region' => 'mazowieckie',
                'population' => 1790658,
                'is_major_city' => true,
            ],
            [
                'name' => 'Kraków',
                'slug' => 'krakow',
                'latitude' => 50.0647,
                'longitude' => 19.9450,
                'region' => 'małopolskie',
                'population' => 779115,
                'is_major_city' => true,
            ],
            [
                'name' => 'Wrocław',
                'slug' => 'wroclaw',
                'latitude' => 51.1079,
                'longitude' => 17.0385,
                'region' => 'dolnośląskie',
                'population' => 641928,
                'is_major_city' => true,
            ],
            [
                'name' => 'Poznań',
                'slug' => 'poznan',
                'latitude' => 52.4064,
                'longitude' => 16.9252,
                'region' => 'wielkopolskie',
                'population' => 534813,
                'is_major_city' => true,
            ],
            [
                'name' => 'Gdańsk',
                'slug' => 'gdansk',
                'latitude' => 54.3520,
                'longitude' => 18.6466,
                'region' => 'pomorskie',
                'population' => 470907,
                'is_major_city' => true,
            ],
            [
                'name' => 'Łódź',
                'slug' => 'lodz',
                'latitude' => 51.7592,
                'longitude' => 19.4560,
                'region' => 'łódzkie',
                'population' => 670642,
                'is_major_city' => true,
            ],
            [
                'name' => 'Katowice',
                'slug' => 'katowice',
                'latitude' => 50.2649,
                'longitude' => 19.0238,
                'region' => 'śląskie',
                'population' => 292774,
                'is_major_city' => true,
            ],
            [
                'name' => 'Szczecin',
                'slug' => 'szczecin',
                'latitude' => 53.4285,
                'longitude' => 14.5528,
                'region' => 'zachodniopomorskie',
                'population' => 401907,
                'is_major_city' => true,
            ],
            [
                'name' => 'Lublin',
                'slug' => 'lublin',
                'latitude' => 51.2465,
                'longitude' => 22.5684,
                'region' => 'lubelskie',
                'population' => 338586,
                'is_major_city' => false,
            ],
            [
                'name' => 'Bydgoszcz',
                'slug' => 'bydgoszcz',
                'latitude' => 53.1235,
                'longitude' => 18.0084,
                'region' => 'kujawsko-pomorskie',
                'population' => 344091,
                'is_major_city' => false,
            ],
            [
                'name' => 'Białystok',
                'slug' => 'bialystok',
                'latitude' => 53.1325,
                'longitude' => 23.1688,
                'region' => 'podlaskie',
                'population' => 297554,
                'is_major_city' => false,
            ],
            [
                'name' => 'Gdynia',
                'slug' => 'gdynia',
                'latitude' => 54.5189,
                'longitude' => 18.5305,
                'region' => 'pomorskie',
                'population' => 243918,
                'is_major_city' => false,
            ],
        ];

        foreach ($locations as $location) {
            Location::create($location);
        }
    }
}
