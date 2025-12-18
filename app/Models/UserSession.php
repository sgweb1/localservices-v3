<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * UserSession - Sesje użytkownika (behavior tracking)
 * 
 * @property int $id
 * @property string $uuid
 * @property int|null $user_id
 * @property string $session_id
 * @property string $device_type
 * @property int $page_views
 * @property int $actions_count
 * @property int $duration_seconds
 * @property bool $bounce
 */
class UserSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'user_id',
        'session_id',
        'device_type',
        'browser',
        'os',
        'started_at',
        'ended_at',
        'duration_seconds',
        'page_views',
        'actions_count',
        'entry_page',
        'exit_page',
        'bounce',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'bounce' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
