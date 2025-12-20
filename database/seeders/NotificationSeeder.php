<?php

namespace Database\Seeders;

use App\Models\NotificationEvent;
use App\Models\NotificationTemplate;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    /**
     * Seed systemu powiadomień
     */
    public function run(): void
    {
        // Definiuj eventy
        $events = [
            [
                'key' => 'booking.created',
                'name' => 'Nowa rezerwacja',
                'description' => 'Powiadomienie o nowej rezerwacji',
                'available_variables' => ['customer_name', 'provider_name', 'service_name', 'booking_date', 'booking_time', 'booking_id'],
            ],
            [
                'key' => 'booking.confirmed',
                'name' => 'Rezerwacja potwierdzona',
                'description' => 'Powiadomienie o potwierdzeniu rezerwacji przez providera',
                'available_variables' => ['customer_name', 'provider_name', 'service_name', 'booking_date', 'booking_time', 'booking_id'],
            ],
            [
                'key' => 'booking.rejected',
                'name' => 'Rezerwacja odrzucona',
                'description' => 'Powiadomienie o odrzuceniu rezerwacji przez providera',
                'available_variables' => ['customer_name', 'provider_name', 'service_name', 'booking_date', 'booking_time', 'booking_id', 'rejection_reason'],
            ],
            [
                'key' => 'booking.cancelled',
                'name' => 'Rezerwacja anulowana',
                'description' => 'Powiadomienie o anulowaniu rezerwacji',
                'available_variables' => ['customer_name', 'provider_name', 'service_name', 'booking_date', 'booking_time', 'booking_id', 'cancelled_by'],
            ],
            [
                'key' => 'booking.completed',
                'name' => 'Rezerwacja ukończona',
                'description' => 'Powiadomienie o ukończeniu rezerwacji',
                'available_variables' => ['customer_name', 'provider_name', 'service_name', 'booking_date', 'booking_time', 'booking_id'],
            ],
            [
                'key' => 'availability.slot_booked',
                'name' => 'Slot w kalendarzu zarezerwowany',
                'description' => 'Powiadomienie gdy slot w kalendarzu zostaje zajęty przez rezerwację',
                'available_variables' => ['provider_name', 'day_of_week', 'time_slot', 'booking_id'],
            ],
            [
                'key' => 'message.received',
                'name' => 'Nowa wiadomość',
                'description' => 'Powiadomienie o nowej wiadomości w czacie',
                'available_variables' => ['sender_name', 'message_preview', 'conversation_id'],
            ],
            [
                'key' => 'review.received',
                'name' => 'Nowa opinia',
                'description' => 'Powiadomienie o nowej opinii od klienta',
                'available_variables' => ['provider_name', 'customer_name', 'rating', 'review_id', 'service_name'],
            ],
        ];

        foreach ($events as $eventData) {
            $event = NotificationEvent::updateOrCreate(
                ['key' => $eventData['key']],
                $eventData
            );

            // Twórz szablony dla każdego eventu
            $this->createTemplates($event);
        }
    }

    /**
     * Tworzy szablony powiadomień dla eventu
     */
    private function createTemplates(NotificationEvent $event): void
    {
        $templates = match ($event->key) {
            'booking.created' => [
                // Provider dostaje powiadomienie o nowej rezerwacji
                [
                    'recipient_type' => 'provider',
                    'toast_enabled' => true,
                    'toast_type' => 'info',
                    'toast_title' => 'Nowa rezerwacja!',
                    'toast_message' => '{{customer_name}} zarezerwował {{service_name}} na {{booking_date}} o {{booking_time}}',
                    'toast_duration' => 8,
                    'database_enabled' => true,
                    'database_title' => 'Nowa rezerwacja od {{customer_name}}',
                    'database_body' => 'Usługa: {{service_name}}, Data: {{booking_date}} {{booking_time}}',
                    'database_action_url' => '/provider/bookings?booking={{booking_id}}',
                ],
                // Customer dostaje potwierdzenie utworzenia
                [
                    'recipient_type' => 'customer',
                    'toast_enabled' => true,
                    'toast_type' => 'success',
                    'toast_title' => 'Rezerwacja złożona',
                    'toast_message' => 'Twoja rezerwacja u {{provider_name}} czeka na potwierdzenie',
                    'toast_duration' => 5,
                    'database_enabled' => true,
                    'database_title' => 'Rezerwacja złożona',
                    'database_body' => 'Usługa: {{service_name}}, Data: {{booking_date}} {{booking_time}}. Czekamy na potwierdzenie providera.',
                    'database_action_url' => '/customer/bookings?booking={{booking_id}}',
                ],
            ],

            'booking.confirmed' => [
                // Customer dostaje powiadomienie o potwierdzeniu
                [
                    'recipient_type' => 'customer',
                    'toast_enabled' => true,
                    'toast_type' => 'success',
                    'toast_title' => 'Rezerwacja potwierdzona!',
                    'toast_message' => '{{provider_name}} potwierdził Twoją rezerwację na {{booking_date}}',
                    'toast_duration' => 8,
                    'database_enabled' => true,
                    'database_title' => 'Rezerwacja potwierdzona',
                    'database_body' => '{{provider_name}} potwierdził rezerwację {{service_name}} na {{booking_date}} {{booking_time}}',
                    'database_action_url' => '/customer/bookings?booking={{booking_id}}',
                    'email_enabled' => false,
                    'email_subject' => 'Rezerwacja potwierdzona - {{service_name}}',
                    'email_body' => 'Witaj {{customer_name}},\n\n{{provider_name}} potwierdził Twoją rezerwację usługi {{service_name}} na {{booking_date}} o {{booking_time}}.\n\nDo zobaczenia!',
                ],
            ],

            'booking.rejected' => [
                // Customer dostaje powiadomienie o odrzuceniu
                [
                    'recipient_type' => 'customer',
                    'toast_enabled' => true,
                    'toast_type' => 'warning',
                    'toast_title' => 'Rezerwacja odrzucona',
                    'toast_message' => '{{provider_name}} odrzucił Twoją rezerwację. Sprawdź szczegóły.',
                    'toast_duration' => 10,
                    'database_enabled' => true,
                    'database_title' => 'Rezerwacja odrzucona',
                    'database_body' => '{{provider_name}} odrzucił rezerwację {{service_name}} na {{booking_date}}. Powód: {{rejection_reason}}',
                    'database_action_url' => '/customer/bookings?booking={{booking_id}}',
                ],
            ],

            'booking.cancelled' => [
                // Provider o anulowaniu przez customera
                [
                    'recipient_type' => 'provider',
                    'toast_enabled' => true,
                    'toast_type' => 'warning',
                    'toast_title' => 'Rezerwacja anulowana',
                    'toast_message' => '{{customer_name}} anulował rezerwację {{service_name}}',
                    'toast_duration' => 8,
                    'database_enabled' => true,
                    'database_title' => 'Rezerwacja anulowana przez klienta',
                    'database_body' => '{{customer_name}} anulował {{service_name}} na {{booking_date}} {{booking_time}}',
                    'database_action_url' => '/provider/bookings?booking={{booking_id}}',
                ],
                // Customer o anulowaniu przez siebie/providera
                [
                    'recipient_type' => 'customer',
                    'toast_enabled' => true,
                    'toast_type' => 'info',
                    'toast_title' => 'Rezerwacja anulowana',
                    'toast_message' => 'Rezerwacja {{service_name}} u {{provider_name}} została anulowana',
                    'toast_duration' => 8,
                    'database_enabled' => true,
                    'database_title' => 'Rezerwacja anulowana',
                    'database_body' => 'Rezerwacja {{service_name}} na {{booking_date}} została anulowana przez {{cancelled_by}}',
                    'database_action_url' => '/customer/bookings?booking={{booking_id}}',
                ],
            ],

            'booking.completed' => [
                // Customer prośba o opinię
                [
                    'recipient_type' => 'customer',
                    'toast_enabled' => true,
                    'toast_type' => 'success',
                    'toast_title' => 'Jak było?',
                    'toast_message' => 'Oceń usługę {{service_name}} od {{provider_name}}',
                    'toast_duration' => 10,
                    'database_enabled' => true,
                    'database_title' => 'Oceń zrealizowaną usługę',
                    'database_body' => 'Jak oceniasz usługę {{service_name}} od {{provider_name}}? Twoja opinia pomoże innym!',
                    'database_action_url' => '/customer/bookings/{{booking_id}}/review',
                ],
            ],

            'availability.slot_booked' => [
                // Provider informacja o zajętym slocie
                [
                    'recipient_type' => 'provider',
                    'toast_enabled' => true,
                    'toast_type' => 'info',
                    'toast_title' => 'Slot zarezerwowany',
                    'toast_message' => 'Slot {{day_of_week}} {{time_slot}} został zajęty',
                    'toast_duration' => 5,
                    'database_enabled' => false,
                ],
            ],

            'message.received' => [
                // Zarówno provider jak i customer
                [
                    'recipient_type' => 'provider',
                    'toast_enabled' => true,
                    'toast_type' => 'info',
                    'toast_title' => 'Nowa wiadomość',
                    'toast_message' => '{{sender_name}}: {{message_preview}}',
                    'toast_duration' => 6,
                    'database_enabled' => true,
                    'database_title' => 'Nowa wiadomość od {{sender_name}}',
                    'database_body' => '{{message_preview}}',
                    'database_action_url' => '/provider/messages?conversation={{conversation_id}}',
                ],
                [
                    'recipient_type' => 'customer',
                    'toast_enabled' => true,
                    'toast_type' => 'info',
                    'toast_title' => 'Nowa wiadomość',
                    'toast_message' => '{{sender_name}}: {{message_preview}}',
                    'toast_duration' => 6,
                    'database_enabled' => true,
                    'database_title' => 'Nowa wiadomość od {{sender_name}}',
                    'database_body' => '{{message_preview}}',
                    'database_action_url' => '/customer/messages?conversation={{conversation_id}}',
                ],
            ],

            'review.received' => [
                // Provider dostaje nową opinię
                [
                    'recipient_type' => 'provider',
                    'toast_enabled' => true,
                    'toast_type' => 'success',
                    'toast_title' => 'Nowa opinia!',
                    'toast_message' => '{{customer_name}} ocenił {{service_name}} na {{rating}}/5',
                    'toast_duration' => 8,
                    'database_enabled' => true,
                    'database_title' => 'Nowa opinia od {{customer_name}}',
                    'database_body' => 'Ocena: {{rating}}/5 za usługę {{service_name}}',
                    'database_action_url' => '/provider/reviews?review={{review_id}}',
                ],
            ],

            default => [],
        };

        foreach ($templates as $templateData) {
            NotificationTemplate::updateOrCreate(
                [
                    'event_id' => $event->id,
                    'recipient_type' => $templateData['recipient_type'],
                ],
                array_merge([
                    'channels' => ['toast', 'database', 'email', 'push'],
                    'is_active' => true,
                    'user_configurable' => true,
                ], $templateData)
            );
        }
    }
}
