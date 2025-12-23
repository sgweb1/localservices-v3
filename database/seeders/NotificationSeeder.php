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
                'description' => 'Wysyłane gdy klient utworzy nową rezerwację',
                'available_variables' => [
                    'booking_number' => 'Numer rezerwacji (np. BK-12345)',
                    'customer_name' => 'Imię i nazwisko klienta',
                    'provider_name' => 'Imię i nazwisko providera',
                    'service_name' => 'Nazwa usługi',
                    'scheduled_date' => 'Data i godzina rezerwacji',
                    'booking_date' => 'Data rezerwacji',
                    'booking_time' => 'Godzina rezerwacji',
                    'booking_id' => 'ID rezerwacji',
                    'location' => 'Lokalizacja',
                    'total_price' => 'Całkowita cena',
                ],
                'is_active' => true,
            ],
            [
                'key' => 'booking.confirmed',
                'name' => 'Rezerwacja potwierdzona',
                'description' => 'Wysyłane gdy provider zaakceptuje rezerwację',
                'available_variables' => [
                    'booking_number' => 'Numer rezerwacji',
                    'booking_id' => 'ID rezerwacji',
                    'customer_name' => 'Imię klienta',
                    'provider_name' => 'Imię providera',
                    'service_name' => 'Nazwa usługi',
                    'scheduled_date' => 'Data i godzina',
                    'booking_date' => 'Data rezerwacji',
                    'booking_time' => 'Godzina rezerwacji',
                ],
                'is_active' => true,
            ],
            [
                'key' => 'booking.rejected',
                'name' => 'Rezerwacja odrzucona',
                'description' => 'Wysyłane gdy provider odrzuci rezerwację',
                'available_variables' => [
                    'booking_number' => 'Numer rezerwacji',
                    'booking_id' => 'ID rezerwacji',
                    'customer_name' => 'Imię klienta',
                    'provider_name' => 'Imię providera',
                    'service_name' => 'Nazwa usługi',
                    'scheduled_date' => 'Data i godzina',
                    'booking_date' => 'Data rezerwacji',
                    'booking_time' => 'Godzina rezerwacji',
                    'rejection_reason' => 'Powód odrzucenia',
                ],
                'is_active' => true,
            ],
            [
                'key' => 'booking.cancelled',
                'name' => 'Rezerwacja anulowana',
                'description' => 'Wysyłane gdy rezerwacja zostanie anulowana',
                'available_variables' => [
                    'booking_number' => 'Numer rezerwacji',
                    'booking_id' => 'ID rezerwacji',
                    'customer_name' => 'Imię klienta',
                    'provider_name' => 'Imię providera',
                    'service_name' => 'Nazwa usługi',
                    'scheduled_date' => 'Data i godzina',
                    'booking_date' => 'Data rezerwacji',
                    'booking_time' => 'Godzina rezerwacji',
                    'cancelled_by' => 'Kto anulował (customer/provider)',
                    'cancellation_reason' => 'Powód anulowania',
                ],
                'is_active' => true,
            ],
            [
                'key' => 'booking.completed',
                'name' => 'Rezerwacja zakończona',
                'description' => 'Wysyłane po zakończeniu usługi',
                'available_variables' => [
                    'booking_number' => 'Numer rezerwacji',
                    'booking_id' => 'ID rezerwacji',
                    'customer_name' => 'Imię klienta',
                    'provider_name' => 'Imię providera',
                    'service_name' => 'Nazwa usługi',
                    'scheduled_date' => 'Data i godzina',
                    'booking_date' => 'Data rezerwacji',
                    'booking_time' => 'Godzina rezerwacji',
                ],
                'is_active' => true,
            ],
            [
                'key' => 'availability.slot_booked',
                'name' => 'Slot w kalendarzu zarezerwowany',
                'description' => 'Powiadomienie gdy slot w kalendarzu zostaje zajęty',
                'available_variables' => [
                    'provider_name' => 'Imię providera',
                    'day_of_week' => 'Dzień tygodnia',
                    'time_slot' => 'Przedział czasowy',
                    'booking_id' => 'ID rezerwacji',
                ],
                'is_active' => true,
            ],
            [
                'key' => 'message.received',
                'name' => 'Nowa wiadomość',
                'description' => 'Wysyłane gdy użytkownik otrzyma nową wiadomość w czacie',
                'available_variables' => [
                    'sender_name' => 'Imię nadawcy',
                    'message_preview' => 'Fragment wiadomości (50 znaków)',
                    'conversation_id' => 'ID konwersacji',
                ],
                'is_active' => true,
            ],
            [
                'key' => 'review.received',
                'name' => 'Nowa opinia',
                'description' => 'Wysyłane gdy provider otrzyma nową opinię',
                'available_variables' => [
                    'customer_name' => 'Imię klienta',
                    'provider_name' => 'Imię providera',
                    'service_name' => 'Nazwa usługi',
                    'rating' => 'Ocena (1-5)',
                    'review_id' => 'ID opinii',
                    'review_text' => 'Treść opinii',
                ],
                'is_active' => true,
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
                    'channels' => ['email', 'push', 'toast', 'database'],
                    'email_enabled' => true,
                    'email_subject' => 'Nowa rezerwacja od {customer_name}',
                    'email_body' => "Otrzymałeś nową rezerwację!\n\n📅 **Rezerwacja:** {booking_number}\n👤 **Klient:** {customer_name}\n🔧 **Usługa:** {service_name}\n📍 **Lokalizacja:** {location}\n⏰ **Data:** {scheduled_date}\n💰 **Cena:** {total_price} PLN\n\nZaloguj się do panelu aby zaakceptować lub odrzucić rezerwację.",
                    'push_enabled' => true,
                    'push_title' => 'Nowa rezerwacja!',
                    'push_body' => '{customer_name} zarezerwował/a {service_name} na {scheduled_date}',
                    'toast_enabled' => true,
                    'toast_type' => 'success',
                    'toast_title' => 'Nowa rezerwacja!',
                    'toast_message' => '{customer_name} zarezerwował {service_name} na {booking_date} o {booking_time}',
                    'toast_duration' => 8,
                    'database_enabled' => true,
                    'database_title' => 'Nowa rezerwacja od {customer_name}',
                    'database_body' => 'Usługa: {service_name}, Data: {booking_date} {booking_time}',
                    'database_action_url' => '/provider/bookings?booking={booking_id}',
                ],
                // Customer dostaje potwierdzenie utworzenia
                [
                    'recipient_type' => 'customer',
                    'channels' => ['toast', 'database'],
                    'email_enabled' => false,
                    'push_enabled' => false,
                    'toast_enabled' => true,
                    'toast_type' => 'success',
                    'toast_title' => 'Rezerwacja złożona',
                    'toast_message' => 'Twoja rezerwacja u {provider_name} czeka na potwierdzenie',
                    'toast_duration' => 5,
                    'database_enabled' => true,
                    'database_title' => 'Rezerwacja złożona',
                    'database_body' => 'Usługa: {service_name}, Data: {booking_date} {booking_time}. Czekamy na potwierdzenie providera.',
                    'database_action_url' => '/customer/bookings?booking={booking_id}',
                ],
            ],

            'booking.confirmed' => [
                // Customer dostaje powiadomienie o potwierdzeniu
                [
                    'recipient_type' => 'customer',
                    'channels' => ['email', 'push', 'toast', 'database'],
                    'email_enabled' => true,
                    'email_subject' => '{provider_name} zaakceptował/a Twoją rezerwację',
                    'email_body' => "Dobra wiadomość! Twoja rezerwacja została zaakceptowana.\n\n📅 **Rezerwacja:** {booking_number}\n👨‍🔧 **Provider:** {provider_name}\n🔧 **Usługa:** {service_name}\n⏰ **Data:** {scheduled_date}\n\nZobacz szczegóły w panelu klienta.",
                    'email_action_url' => '/customer/bookings?booking={booking_id}',
                    'push_enabled' => true,
                    'push_title' => 'Rezerwacja potwierdzona!',
                    'push_body' => '{provider_name} zaakceptował/a {service_name}',
                    'push_action_url' => '/customer/bookings?booking={booking_id}',
                    'toast_enabled' => true,
                    'toast_type' => 'success',
                    'toast_title' => 'Rezerwacja potwierdzona!',
                    'toast_message' => '{provider_name} potwierdził Twoją rezerwację na {booking_date}',
                    'toast_duration' => 8,
                    'database_enabled' => true,
                    'database_title' => 'Rezerwacja potwierdzona',
                    'database_body' => '{provider_name} potwierdził rezerwację {service_name} na {booking_date} {booking_time}',
                    'database_action_url' => '/customer/bookings?booking={booking_id}',
                ],
            ],

            'booking.rejected' => [
                // Customer dostaje powiadomienie o odrzuceniu
                [
                    'recipient_type' => 'customer',
                    'channels' => ['email', 'push', 'toast', 'database'],
                    'email_enabled' => true,
                    'email_subject' => 'Rezerwacja odrzucona - {service_name}',
                    'email_body' => "Rezerwacja została odrzucona.\n\n❌ **Rezerwacja:** {booking_number}\n👨‍🔧 **Provider:** {provider_name}\n🔧 **Usługa:** {service_name}\n📝 **Powód:** {rejection_reason}\n\nSpróbuj zarezerwować u innego providera.",
                    'email_action_url' => '/customer/services',
                    'push_enabled' => true,
                    'push_title' => 'Rezerwacja odrzucona',
                    'push_body' => '{provider_name} odrzucił rezerwację - {rejection_reason}',
                    'push_action_url' => '/customer/bookings?booking={booking_id}',
                    'toast_enabled' => true,
                    'toast_type' => 'warning',
                    'toast_title' => 'Rezerwacja odrzucona',
                    'toast_message' => '{provider_name} odrzucił Twoją rezerwację. Sprawdź szczegóły.',
                    'toast_duration' => 10,
                    'database_enabled' => true,
                    'database_title' => 'Rezerwacja odrzucona',
                    'database_body' => '{provider_name} odrzucił rezerwację {service_name} na {booking_date}. Powód: {rejection_reason}',
                    'database_action_url' => '/customer/bookings?booking={booking_id}',
                ],
            ],

            'booking.cancelled' => [
                // Provider o anulowaniu przez customera
                [
                    'recipient_type' => 'provider',
                    'channels' => ['email', 'push', 'toast', 'database'],
                    'email_enabled' => true,
                    'email_subject' => 'Rezerwacja {booking_number} została anulowana',
                    'email_body' => "Rezerwacja została anulowana.\n\n❌ **Rezerwacja:** {booking_number}\n🔧 **Usługa:** {service_name}\n👤 **Klient:** {customer_name}\n⏰ **Data:** {scheduled_date}",
                    'email_action_url' => '/provider/bookings',
                    'push_enabled' => true,
                    'push_title' => 'Rezerwacja anulowana',
                    'push_body' => '{customer_name} anulował rezerwację {service_name}',
                    'push_action_url' => '/provider/bookings',
                    'toast_enabled' => true,
                    'toast_type' => 'warning',
                    'toast_title' => 'Rezerwacja anulowana',
                    'toast_message' => '{customer_name} anulował rezerwację {service_name}',
                    'toast_duration' => 8,
                    'database_enabled' => true,
                    'database_title' => 'Rezerwacja anulowana przez klienta',
                    'database_body' => '{customer_name} anulował {service_name} na {booking_date} {booking_time}',
                    'database_action_url' => '/provider/bookings?booking={booking_id}',
                ],
                // Customer o anulowaniu przez siebie/providera
                [
                    'recipient_type' => 'customer',
                    'channels' => ['email', 'push', 'toast', 'database'],
                    'email_enabled' => true,
                    'email_subject' => 'Rezerwacja {booking_number} została anulowana',
                    'email_body' => "Rezerwacja została anulowana.\n\n❌ **Rezerwacja:** {booking_number}\n🔧 **Usługa:** {service_name}\n👨‍🔧 **Provider:** {provider_name}\n⏰ **Data:** {scheduled_date}",
                    'email_action_url' => '/customer/bookings',
                    'push_enabled' => true,
                    'push_title' => 'Rezerwacja anulowana',
                    'push_body' => 'Rezerwacja {service_name} u {provider_name} została anulowana',
                    'push_action_url' => '/customer/bookings',
                    'toast_enabled' => true,
                    'toast_type' => 'info',
                    'toast_title' => 'Rezerwacja anulowana',
                    'toast_message' => 'Rezerwacja {service_name} u {provider_name} została anulowana',
                    'toast_duration' => 8,
                    'database_enabled' => true,
                    'database_title' => 'Rezerwacja anulowana',
                    'database_body' => 'Rezerwacja {service_name} na {booking_date} została anulowana przez {cancelled_by}',
                    'database_action_url' => '/customer/bookings?booking={booking_id}',
                ],
            ],

            'booking.completed' => [
                // Customer prośba o opinię
                [
                    'recipient_type' => 'customer',
                    'channels' => ['toast', 'database'],
                    'email_enabled' => false,
                    'push_enabled' => false,
                    'toast_enabled' => true,
                    'toast_type' => 'success',
                    'toast_title' => 'Jak było?',
                    'toast_message' => 'Oceń usługę {service_name} od {provider_name}',
                    'toast_duration' => 10,
                    'database_enabled' => true,
                    'database_title' => 'Oceń zrealizowaną usługę',
                    'database_body' => 'Jak oceniasz usługę {service_name} od {provider_name}? Twoja opinia pomoże innym!',
                    'database_action_url' => '/customer/bookings/{booking_id}/review',
                ],
            ],

            'availability.slot_booked' => [
                // Provider informacja o zajętym slocie
                [
                    'recipient_type' => 'provider',
                    'channels' => ['toast'],
                    'email_enabled' => false,
                    'push_enabled' => false,
                    'toast_enabled' => true,
                    'toast_type' => 'info',
                    'toast_title' => 'Slot zarezerwowany',
                    'toast_message' => 'Slot {day_of_week} {time_slot} został zajęty',
                    'toast_duration' => 5,
                    'database_enabled' => false,
                ],
            ],

            'message.received' => [
                // Provider dostaje nową wiadomość
                [
                    'recipient_type' => 'provider',
                    'channels' => ['push', 'toast', 'database'],
                    'email_enabled' => false,
                    'push_enabled' => true,
                    'push_title' => 'Nowa wiadomość od {sender_name}',
                    'push_body' => '{message_preview}',
                    'push_action_url' => '/provider/messages?conversation={conversation_id}',
                    'toast_enabled' => true,
                    'toast_type' => 'info',
                    'toast_title' => 'Nowa wiadomość',
                    'toast_message' => '{sender_name}: {message_preview}',
                    'toast_duration' => 6,
                    'database_enabled' => true,
                    'database_title' => 'Nowa wiadomość od {sender_name}',
                    'database_body' => '{message_preview}',
                    'database_action_url' => '/provider/messages?conversation={conversation_id}',
                ],
                // Customer dostaje nową wiadomość
                [
                    'recipient_type' => 'customer',
                    'channels' => ['push', 'toast', 'database'],
                    'email_enabled' => false,
                    'push_enabled' => true,
                    'push_title' => 'Nowa wiadomość od {sender_name}',
                    'push_body' => '{message_preview}',
                    'push_action_url' => '/customer/messages?conversation={conversation_id}',
                    'toast_enabled' => true,
                    'toast_type' => 'info',
                    'toast_title' => 'Nowa wiadomość',
                    'toast_message' => '{sender_name}: {message_preview}',
                    'toast_duration' => 6,
                    'database_enabled' => true,
                    'database_title' => 'Nowa wiadomość od {sender_name}',
                    'database_body' => '{message_preview}',
                    'database_action_url' => '/customer/messages?conversation={conversation_id}',
                ],
            ],

            'review.received' => [
                // Provider dostaje nową opinię
                [
                    'recipient_type' => 'provider',
                    'channels' => ['email', 'push', 'toast', 'database'],
                    'email_enabled' => true,
                    'email_subject' => 'Nowa opinia od {customer_name} - {rating}⭐',
                    'email_body' => "Otrzymałeś nową opinię!\n\n⭐ **Ocena:** {rating}/5\n👤 **Klient:** {customer_name}\n🔧 **Usługa:** {service_name}\n\n📝 **Opinia:**\n{review_text}\n\nZobacz szczegóły w panelu.",
                    'email_action_url' => '/provider/reviews',
                    'push_enabled' => true,
                    'push_title' => 'Nowa opinia - {rating}⭐',
                    'push_body' => '{customer_name} wystawił opinię o {service_name}',
                    'push_action_url' => '/provider/reviews',
                    'toast_enabled' => true,
                    'toast_type' => 'success',
                    'toast_title' => 'Nowa opinia!',
                    'toast_message' => '{customer_name} ocenił {service_name} na {rating}/5',
                    'toast_duration' => 8,
                    'database_enabled' => true,
                    'database_title' => 'Nowa opinia od {customer_name}',
                    'database_body' => 'Ocena: {rating}/5 za usługę {service_name}',
                    'database_action_url' => '/provider/reviews?review={review_id}',
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
                    'is_active' => true,
                    'user_configurable' => true,
                ], $templateData)
            );
        }
    }
}