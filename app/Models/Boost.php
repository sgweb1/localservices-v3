<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model Boost - placeholder dla testów
 * 
 * Rzeczywisty model usunięty z projektu - zachowywany dla kompatybilności testów
 * Testy Boost są pomijane poprzez atrybuty #[Ignore]
 */
class Boost extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider_id',
        'type',
        'city',
        'is_active',
        'expires_at',
        'price',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
    ];
}
