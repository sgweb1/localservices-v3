<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event wysyłany przez WebSocket do konkretnego użytkownika
 * Powiadomienie toast wyświetlane w prawym górnym rogu UI
 */
class NotificationToastEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @param int $userId ID użytkownika - odbiorca powiadomienia
     * @param string|null $title Tytuł toastu
     * @param string $message Treść wiadomości toast
     * @param string $type Typ: 'info', 'success', 'warning', 'error'
     * @param string|null $actionUrl URL do przekierowania po kliknięciu (opcjonalny)
     * @param array $metadata Dodatkowe dane (np. ikona, avatar, czas)
     */
    public function __construct(
        public int $userId,
        public ?string $title = null,
        public string $message = '',
        public string $type = 'info',
        public ?string $actionUrl = null,
        public array $metadata = [],
    ) {}

    /**
     * Kanał prywatny dla konkretnego użytkownika
     * Format: user.{userId}
     */
    public function broadcastOn(): Channel
    {
        return new PrivateChannel("user.{$this->userId}");
    }

    /**
     * Nazwa eventu dla frontendu
     * Frontend nasłuchuje: Echo.private(`user.${userId}`).listen('NotificationToast', ...)
     */
    public function broadcastAs(): string
    {
        return 'NotificationToast';
    }

    /**
     * Data wysyłana do frontendu
     */
    public function broadcastWith(): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'type' => $this->type,
            'action_url' => $this->actionUrl,
            'metadata' => $this->metadata,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
