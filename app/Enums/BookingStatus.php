<?php

namespace App\Enums;

enum BookingStatus: string
{
    case PENDING = 'pending';
    case QUOTE_SENT = 'quote_sent';
    case CONFIRMED = 'confirmed';
    case IN_PROGRESS = 'in_progress';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';
    case NO_SHOW = 'no_show';
    case DISPUTED = 'disputed';
}
