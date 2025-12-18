<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Location;
use App\Models\User;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    /**
     * Seed usług marketplace (realistyczne oferty).
     */
    public function run(): void
    {
        $categories = ServiceCategory::all()->keyBy('slug');
        $locations = Location::all()->keyBy('slug');
        $providers = User::where('user_type', 'provider')->get();

        if ($providers->isEmpty()) {
            $this->command->error('Brak providerów - uruchom najpierw UserSeeder');
            return;
        }

        $services = [
            // Hydraulika
            [
                'provider_id' => $providers->where('city', 'Warszawa')->first()->id,
                'category_id' => $categories['hydraulika']->id,
                'location_id' => $locations['warszawa']->id,
                'title' => 'Hydraulik - awarie 24/7 Warszawa centrum',
                'description' => 'Profesjonalne usługi hydrauliczne dostępne całą dobę. Specjalizuję się w naprawach awaryjnych, montażu instalacji wodociągowych, wymian...ie baterii i toalet. Dojazd w ciągu godziny w obrębie centrum Warszawy. Posiadam pełne ubezpieczenie OC. Pracuję na sprawdzonych materiałach z gwarancją. W cenie: diagnostyka, dojazd, materiały eksploatacyjne. Koszty części ustalam przed rozpoczęciem prac.',
                'what_included' => 'Dojazd, diagnostyka, drobne materiały, gwarancja 12 miesięcy',
                'pricing_type' => 'hourly',
                'base_price' => 150.00,
                'pricing_unit' => 'godzina',
                'instant_booking' => true,
                'accepts_quote_requests' => true,
                'min_notice_hours' => 1,
                'duration_minutes' => 60,
                'max_distance_km' => 25,
                'willing_to_travel' => true,
                'travel_fee_per_km' => 2.00,
                'cancellation_policy' => 'Anulowanie do 2 godzin przed wizytą bez kosztów',
                'status' => 'active',
                'is_featured' => true,
                'published_at' => now(),
            ],
            [
                'provider_id' => $providers->where('city', 'Szczecin')->first()->id,
                'category_id' => $categories['hydraulika']->id,
                'location_id' => $locations['szczecin']->id,
                'title' => 'Instalacje hydrauliczne - domy i mieszkania',
                'description' => 'Kompleksowe usługi hydrauliczne: montaż instalacji wodociągowych i kanalizacyjnych w nowych budynkach, modernizacje starych instalacji, wymiana rur, montaż pomp ciepła, ogrzewania podłogowego. Pracuję według projektu lub opracowuję własny. Doświadczenie 15 lat, referencje z dziesiątek realizacji. Dbam o terminowość i czystość na budowie.',
                'what_included' => 'Konsultacja, wycena, wykonanie, sprzątanie',
                'pricing_type' => 'quote',
                'price_range_low' => 2000.00,
                'price_range_high' => 15000.00,
                'instant_booking' => false,
                'accepts_quote_requests' => true,
                'min_notice_hours' => 48,
                'max_distance_km' => 40,
                'willing_to_travel' => true,
                'travel_fee_per_km' => 1.50,
                'status' => 'active',
                'published_at' => now(),
            ],
            
            // Elektryka
            [
                'provider_id' => $providers->where('city', 'Kraków')->first()->id,
                'category_id' => $categories['elektryka']->id,
                'location_id' => $locations['krakow']->id,
                'title' => 'Elektryk Kraków - instalacje i naprawy',
                'description' => 'Fachowe usługi elektryczne w Krakowie i okolicach. Wymiana instalacji elektrycznej, montaż rozdzielnic, podłączanie AGD, montaż lamp, gniazd, włączników. Naprawy awarie, diagnostyka usterek. Posiadam uprawnienia SEP do 1kV. Wystawiam protokoły i certyfikaty. Pracuję szybko, czysto i solidnie. Uczciwe ceny bez ukrytych kosztów.',
                'what_included' => 'Dojazd w obrębie Krakowa, diagnostyka, drobny materiał',
                'pricing_type' => 'hourly',
                'base_price' => 120.00,
                'pricing_unit' => 'godzina',
                'instant_booking' => true,
                'min_notice_hours' => 24,
                'duration_minutes' => 120,
                'max_distance_km' => 30,
                'willing_to_travel' => true,
                'travel_fee_per_km' => 2.50,
                'status' => 'active',
                'is_featured' => true,
                'published_at' => now(),
            ],
            
            // Sprzątanie
            [
                'provider_id' => $providers->where('city', 'Wrocław')->first()->id,
                'category_id' => $categories['sprzatanie']->id,
                'location_id' => $locations['wroclaw']->id,
                'title' => 'Sprzątanie mieszkań Wrocław - szybko i dokładnie',
                'description' => 'Profesjonalne sprzątanie mieszkań, domów i biur we Wrocławiu. Standardowe sprzątanie: odkurzanie, mycie podłóg, łazienki, kuchnia, odkurzanie mebli. Sprzątanie po remoncie, pranie tapicerki, mycie okien. Używam ekologicznych środków czystości bezpiecznych dla alergików. Elastyczne terminy, także weekendy. Mogę przynieść własny sprzęt i środki lub używać Państwa.',
                'what_included' => 'Podstawowy sprzęt i środki, dojazd we Wrocławiu',
                'pricing_type' => 'fixed',
                'base_price' => 180.00,
                'pricing_unit' => 'mieszkanie do 50m²',
                'instant_booking' => true,
                'min_notice_hours' => 48,
                'duration_minutes' => 180,
                'max_distance_km' => 20,
                'willing_to_travel' => true,
                'travel_fee_per_km' => 0.00,
                'status' => 'active',
                'is_featured' => true,
                'published_at' => now(),
            ],
            [
                'provider_id' => $providers->where('city', 'Lublin')->first()->id,
                'category_id' => $categories['sprzatanie']->id,
                'location_id' => $locations['lublin']->id,
                'title' => 'Sprzątanie po remoncie - usuwanie gruzu',
                'description' => 'Specjalizuję się w sprzątaniu po remontach i budowie. Usuwam kurz po szlifowaniu, plamy po farbie, gruz, odpady budowlane. Myję okna, podłogi, kafelki. Zostawiam mieszkanie gotowe do zamieszkania. Posiadam profesjonalny sprzęt: myjki ciśnieniowe, odkurzacze przemysłowe, środki do usuwania trudnych plam. Cena zależy od zakresu zniszczeń - wycena po obejrzeniu.',
                'what_included' => 'Sprzęt, środki czystości, wywóz drobnego gruzu',
                'pricing_type' => 'quote',
                'price_range_low' => 300.00,
                'price_range_high' => 1500.00,
                'instant_booking' => false,
                'accepts_quote_requests' => true,
                'min_notice_hours' => 72,
                'max_distance_km' => 25,
                'willing_to_travel' => true,
                'status' => 'active',
                'published_at' => now(),
            ],
            
            // Korepetycje
            [
                'provider_id' => $providers->where('city', 'Poznań')->first()->id,
                'category_id' => $categories['korepetycje']->id,
                'location_id' => $locations['poznan']->id,
                'title' => 'Korepetycje z matematyki - matura, liceum, technikum',
                'description' => 'Doświadczony nauczyciel matematyki z 10-letnim stażem przygotowuje do matury, poprawek, egzaminów. Prowadzę zajęcia online lub u ucznia. Specjalizacja: matura podstawowa i rozszerzona, olimpiady, egzaminy ósmoklasisty. Indywidualne podejście do każdego ucznia, własne materiały dydaktyczne, testy próbne. Wysoka zdawalność: 95% uczniów zdaje maturę za pierwszym razem.',
                'what_included' => 'Materiały dydaktyczne, testy, dostęp do platformy online',
                'pricing_type' => 'hourly',
                'base_price' => 80.00,
                'pricing_unit' => 'godzina (60 min)',
                'instant_booking' => true,
                'min_notice_hours' => 12,
                'duration_minutes' => 90,
                'max_distance_km' => 15,
                'willing_to_travel' => true,
                'travel_fee_per_km' => 1.00,
                'status' => 'active',
                'published_at' => now(),
            ],
            
            // Opieka
            [
                'provider_id' => $providers->where('city', 'Gdańsk')->first()->id,
                'category_id' => $categories['opieka']->id,
                'location_id' => $locations['gdansk']->id,
                'title' => 'Opieka nad osobami starszymi - całodobowa lub dzienna',
                'description' => 'Profesjonalna opieka nad osobami starszymi i niepełnosprawnymi w Gdańsku i Trójmieście. Posiadam wykształcenie pielęgniarskie i 8 lat doświadczenia. Zapewniam: opiekę higieniczną, podawanie leków, pomoc w czynnościach dnia codziennego, towarzystwo, wsparcie emocjonalne. Możliwa opieka całodobowa lub w wybranych godzinach. Dokumenty: zaświadczenie o niekaralności, badania lekarskie, referencje.',
                'what_included' => 'Kompletna opieka, dokumentacja medyczna, stały kontakt z rodziną',
                'pricing_type' => 'hourly',
                'base_price' => 35.00,
                'pricing_unit' => 'godzina',
                'instant_booking' => false,
                'accepts_quote_requests' => true,
                'min_notice_hours' => 168, // tydzień
                'duration_minutes' => 480, // 8h
                'max_distance_km' => 30,
                'willing_to_travel' => true,
                'status' => 'active',
                'is_featured' => true,
                'published_at' => now(),
            ],
            
            // Ogrodnictwo
            [
                'provider_id' => $providers->where('city', 'Warszawa')->first()->id,
                'category_id' => $categories['ogrodnictwo']->id,
                'location_id' => $locations['warszawa']->id,
                'title' => 'Pielęgnacja ogrodów - koszenie, przycinanie, nawożenie',
                'description' => 'Kompleksowa pielęgnacja ogrodów przydomowych w Warszawie. Koszenie trawników, wertykulacja, nawożenie, przycinanie żywopłotów i krzewów ozdobnych, grabienie liści, odchwaszczanie. Posiadam profesjonalny sprzęt: kosiarka spalinowa, nożyce akumulatorowe, dmuchawa, wertykulat or. Regularne zlecenia z rabatem. Dojazd w obrębie Warszawy gratis.',
                'what_included' => 'Sprzęt, paliwo, wywóz ścinki (do 50kg)',
                'pricing_type' => 'fixed',
                'base_price' => 200.00,
                'pricing_unit' => 'działka do 500m²',
                'instant_booking' => true,
                'min_notice_hours' => 48,
                'duration_minutes' => 180,
                'max_distance_km' => 25,
                'willing_to_travel' => true,
                'status' => 'active',
                'published_at' => now(),
            ],
            
            // Budowlane
            [
                'provider_id' => $providers->where('city', 'Łódź')->first()->id,
                'category_id' => $categories['budowlane']->id,
                'location_id' => $locations['lodz']->id,
                'title' => 'Malowanie, gładzie, tapetowanie - kompleksowo',
                'description' => 'Profesjonalne malowanie mieszkań, domów i biur w Łodzi. Wykonuję: gładzie gipsowe, szpachlowanie, malowanie farbami akrylowymi i lateksowymi, tapetowanie, usuwanie starych tapet. Dbam o czystość i terminowość. Przed pracami zabezpieczam meble i podłogi. Po zakończeniu zostawiam mieszkanie czyste. Ceny negocjowalne przy większych zleceniach. Wycena po obejrzeniu.',
                'what_included' => 'Praca, folii zabezpieczające, podstawowe narzędzia',
                'pricing_type' => 'quote',
                'price_range_low' => 1500.00,
                'price_range_high' => 8000.00,
                'instant_booking' => false,
                'accepts_quote_requests' => true,
                'min_notice_hours' => 120,
                'max_distance_km' => 30,
                'willing_to_travel' => true,
                'travel_fee_per_km' => 1.00,
                'status' => 'active',
                'published_at' => now(),
            ],
            
            // IT
            [
                'provider_id' => $providers->where('city', 'Katowice')->first()->id,
                'category_id' => $categories['it-komputery']->id,
                'location_id' => $locations['katowice']->id,
                'title' => 'Naprawa komputerów i laptopów - serwis na miejscu',
                'description' => 'Serwis komputerowy w Katowicach - przyjazd do klienta w ciągu 24h. Naprawa komputerów stacjonarnych i laptopów, wymiana podzespołów, czyszczenie z kurzu, wymiana past termoprzewodzących. Instalacja systemów Windows/Linux, usuwanie wirusów, konfiguracja sieci domowych, odzyskiwanie danych. Diagnoza gratis. Gwarancja na części i robociznę. Uczciwe ceny, faktury VAT.',
                'what_included' => 'Dojazd, diagnoza, podstawowa konfiguracja',
                'pricing_type' => 'hourly',
                'base_price' => 100.00,
                'pricing_unit' => 'godzina',
                'instant_booking' => true,
                'min_notice_hours' => 24,
                'duration_minutes' => 120,
                'max_distance_km' => 20,
                'willing_to_travel' => true,
                'travel_fee_per_km' => 2.00,
                'status' => 'active',
                'published_at' => now(),
            ],
        ];

        foreach ($services as $serviceData) {
            Service::create($serviceData);
        }

        $this->command->info('Utworzono ' . count($services) . ' usług marketplace');
    }
}
