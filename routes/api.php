<?php

use Illuminate\Support\Facades\Route;

// Lekki mock API dla testów E2E (włączony na env local, kontrola przez E2E_MOCK)
if (app()->environment('local') && env('E2E_MOCK', true)) {
	Route::middleware('api')->prefix('v1')->group(function () {
		Route::get('/locations', function () {
			return response()->json([
				'data' => [
					[
						'id' => 1,
						'name' => 'Warszawa',
						'slug' => 'warszawa',
						'latitude' => 52.2297,
						'longitude' => 21.0122,
						'is_major_city' => true,
					],
					[
						'id' => 2,
						'name' => 'Kraków',
						'slug' => 'krakow',
						'latitude' => 50.0647,
						'longitude' => 19.945,
						'is_major_city' => true,
					],
				],
			]);
		});

		Route::get('/locations/major-cities', function () {
			return response()->json([
				'data' => [
					[
						'id' => 1,
						'name' => 'Warszawa',
						'slug' => 'warszawa',
						'latitude' => 52.2297,
						'longitude' => 21.0122,
						'is_major_city' => true,
					],
				],
			]);
		});

		Route::get('/services', function () {
			$services = [
				[
					'id' => 1,
					'uuid' => 'mock-1',
					'name' => 'Naprawa hydrauliki',
					'description' => 'Profesjonalna naprawa instalacji wodnych',
					'base_price' => 150,
					'category' => [
						'id' => 1,
						'name' => 'Hydraulika',
						'slug' => 'plumbing',
					],
					'city' => 'Warszawa',
					'latitude' => 52.2297,
					'longitude' => 21.0122,
					'provider' => [
						'id' => 10,
						'name' => 'Jan Kowalski',
						'avatar' => null,
						'rating' => 4.6,
						'reviews_count' => 12,
					],
				],
				[
					'id' => 2,
					'uuid' => 'mock-2',
					'name' => 'Instalacje elektryczne',
					'description' => 'Montaż i naprawa instalacji elektrycznych',
					'base_price' => 220,
					'category' => [
						'id' => 2,
						'name' => 'Elektryka',
						'slug' => 'electrical',
					],
					'city' => 'Kraków',
					'latitude' => 50.0647,
					'longitude' => 19.945,
					'provider' => [
						'id' => 11,
						'name' => 'Anna Nowak',
						'avatar' => null,
						'rating' => 4.9,
						'reviews_count' => 25,
					],
				],
			];

			return response()->json([
				'data' => $services,
				'meta' => [
					'current_page' => 1,
					'per_page' => 12,
					'total' => count($services),
					'last_page' => 1,
				],
			]);
		});

		Route::get('/services/{id}', function ($id) {
			return response()->json([
				'data' => [
					'id' => (int) $id,
					'uuid' => 'mock-detail-' . $id,
					'name' => 'Usługa mock ' . $id,
					'description' => 'Szczegóły usługi mock ' . $id,
					'base_price' => 200,
					'category' => [
						'id' => 99,
						'name' => 'Mock',
						'slug' => 'mock',
					],
					'city' => 'Warszawa',
					'latitude' => 52.2297,
					'longitude' => 21.0122,
					'provider' => [
						'id' => 99,
						'name' => 'Mock Provider',
						'avatar' => null,
						'rating' => 4.7,
						'reviews_count' => 5,
					],
				],
			]);
		});
	});
}

// API routes are registered in bootstrap/app.php
// API v1 routes are in routes/api/v1/profile.php
