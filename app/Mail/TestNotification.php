<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class TestNotification extends Mailable
{
    public function __construct(
        public $user,
        public $eventName
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[TEST] ' . $this->eventName,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.test-notification',
            with: [
                'user' => $this->user,
                'eventName' => $this->eventName,
                'timestamp' => now()->format('Y-m-d H:i:s'),
            ],
        );
    }
}
