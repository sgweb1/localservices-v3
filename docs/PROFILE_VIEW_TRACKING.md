# Profile View Tracking - Dokumentacja

## Przegląd

System trackowania wyświetleń profilu pozwala zbierać realne dane analityczne o tym:
- Ile razy profil providera został wyświetlony
- Skąd przychodzą użytkownicy (źródła ruchu)
- Jak zmienia się zainteresowanie profilem w czasie

## Tabela `profile_views`

```sql
- id
- provider_id (FK → users)
- viewer_id (nullable FK → users) - null dla gości
- source (search, google_ads, social_media, direct, referral)
- referrer (pełny URL referrera)
- user_agent
- ip_address
- viewed_at (timestamp)
```

## Model `ProfileView`

```php
use App\Models\ProfileView;

// Określ źródło na podstawie referrera
$source = ProfileView::determineSource($request->header('referer'));
// Zwraca: 'search', 'google_ads', 'social_media', 'direct', 'referral'
```

## Service `ProfileViewTracker`

### Podstawowe użycie

```php
use App\Services\ProfileViewTracker;

class ProviderProfileController extends Controller
{
    public function show(int $id, ProfileViewTracker $tracker)
    {
        $provider = User::findOrFail($id);
        
        // Zapisz wyświetlenie profilu
        $tracker->track($id);
        
        return view('provider.profile', compact('provider'));
    }
}
```

### Zapobieganie duplikatom (trackOnce)

```php
// Zapisuje view tylko jeśli użytkownik nie wyświetlił tego profilu w ciągu 30 minut
$tracker->trackOnce($providerId, $minutesThreshold = 30);
```

### Sprawdzenie czy był ostatnio view

```php
if ($tracker->hasRecentView($providerId, 30)) {
    // Użytkownik był tu w ciągu ostatnich 30 minut
}
```

## Integracja z Analytics

System automatycznie używa `profile_views` do:

1. **Wyświetlenia profilu** - rzeczywista liczba views z okresu
2. **Źródła ruchu** - agregacja per `source`:
   - Wyszukiwarka (search)
   - Google Ads (google_ads)
   - Social Media (social_media)
   - Bezpośredni (direct)
   - Inne źródła (referral)
3. **Wykres views** - agregacja per dzień

## Przykład implementacji w kontrolerze

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\ProfileViewTracker;
use Illuminate\Http\Request;

class ProviderPublicProfileController extends Controller
{
    public function show(int $id, ProfileViewTracker $tracker)
    {
        $provider = User::with(['services', 'reviews'])
            ->findOrFail($id);
        
        // Nie trackuj własnych wyświetleń
        if (auth()->id() !== $provider->id) {
            // Zapisz tylko raz na 30 minut żeby nie duplikować przy odświeżaniu
            $tracker->trackOnce($provider->id, 30);
        }
        
        return view('providers.profile', compact('provider'));
    }
}
```

## API Endpoint (opcjonalnie)

Jeśli profil jest widoczny przez API/SPA, możesz dodać endpoint:

```php
// routes/api.php
Route::post('/providers/{id}/track-view', [ProviderViewController::class, 'track']);

// Controller
public function track(int $id, ProfileViewTracker $tracker)
{
    $tracker->trackOnce($id, 30);
    return response()->json(['success' => true]);
}
```

## Testowanie

Wygeneruj przykładowe dane:

```bash
php artisan db:seed --class=ProfileViewSeeder
```

Sprawdź dane:

```bash
php artisan tinker
>>> ProfileView::count()
>>> ProfileView::groupBy('source')->selectRaw('source, count(*) as total')->get()
```

## Privacy & GDPR

- IP adresy są hashowane (możesz dodać hashing w modelu jeśli potrzeba)
- viewer_id jest nullable - goście są trackowane przez IP
- Dane są anonimowe - nie zapisujemy PII poza user_id (który jest już w systemie)
