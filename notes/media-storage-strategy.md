# Strategia Zarządzania Mediami - LocalServices

**Data utworzenia:** 2025-12-23  
**Status:** Plan do implementacji  
**Priorytet:** Wysoki - infrastruktura

## 1. Przegląd Problemów

### Obecna Sytuacja
- ❌ Brak struktury katalogów
- ❌ Brak standardów nazewnictwa plików
- ❌ Brak oczyszczania starych plików
- ❌ Trudna migracja do chmury
- ❌ Brak optymalizacji obrazów

### Typy Mediów w Systemie
1. **Avatary** - zdjęcia profilowe użytkowników/providerów
2. **Portfolio** - galeria zdjęć providera (wiele zdjęć)
3. **Zdjęcia usług** - zdjęcia przypisane do konkretnych usług
4. **Zdjęcia opinii** - zdjęcia dodawane przez klientów w opiniach
5. **Dokumenty weryfikacji** - dowody tożsamości, certyfikaty (wrażliwe)
6. **Tymczasowe** - pliki w trakcie przetwarzania

---

## 2. Proponowana Struktura Katalogów

### 2.1 Organizacja Główna (Sharded)
```
storage/app/public/
├── avatars/                    # Avatary użytkowników (SHARDED)
│   ├── 000/                   # Shard 000 (user_id % 1000 == 0-999)
│   │   ├── 1000/              # user_id = 1000
│   │   │   ├── original.jpg
│   │   │   ├── large.jpg      # 512x512
│   │   │   ├── medium.jpg     # 256x256
│   │   │   └── thumb.jpg      # 128x128
│   │   └── 2000/
│   ├── 001/                   # Shard 001
│   │   ├── 1001/
│   │   └── 2001/
│   └── 999/                   # Shard 999
│
├── providers/                  # Media providerów (SHARDED)
│   ├── 000/
│   │   ├── 1000/
│   │   │   ├── portfolio/     # Galeria providera
│   │   │   │   ├── {uuid}.jpg
│   │   │   │   └── thumbs/
│   │   │   │       └── {uuid}.jpg
│   │   │   └── documents/     # Dokumenty weryfikacyjne (PRIVATE!)
│   │   │       ├── id_front.jpg
│   │   │       └── certificates/
│   ├── 001/
│   └── 999/
│
├── services/                   # Zdjęcia usług (SHARDED)
│   ├── 000/
│   │   ├── 5000/              # service_id = 5000
│   │   │   ├── main.jpg       # Główne zdjęcie
│   │   │   ├── gallery/       # Dodatkowe zdjęcia
│   │   │   │   ├── {uuid}.jpg
│   │   │   └── thumbs/
│   │   │       └── {uuid}.jpg
│   ├── 001/
│   └── 999/
│
├── reviews/                    # Zdjęcia z opinii (SHARDED)
│   ├── 000/
│   │   ├── 10000/             # review_id = 10000
│   │   │   ├── {uuid}.jpg     # Oryginały
│   │   │   └── thumbs/
│   │   │       └── {uuid}.jpg
│   ├── 001/
│   └── 999/
│
└── temp/                       # Pliki tymczasowe
    └── uploads/                # Przed przetworzeniem
        └── {session_id}/

storage/app/private/            # Prywatne (bez public link)
└── documents/                  # Dokumenty weryfikacji, faktury (SHARDED)
    ├── 000/
    │   └── {user_id}/
    │       ├── verification/
    │       └── invoices/
    ├── 001/
    └── 999/
```

**Dlaczego Sharding?**
- **Filesystem limits:** Ext4 max ~10M plików per directory
- **Performance:** Lookup O(1) zamiast O(n) przy 100k+ plikach
- **Równomierne rozłożenie:** Modulo zapewnia uniform distribution
- **Skalowanie:** 1000 shardów × 10M plików = 10B plików obsługiwane

### 2.2 Sharding Helper
```php
// app/Helpers/MediaHelper.php
class MediaHelper
{
    /**
     * Oblicz shard dla ID (modulo 1000)
     * 
     * @param int $id User/Provider/Service/Review ID
     * @return string Trzycyfrowy shard (000-999)
     */
    public static function getShard(int $id): string
    {
        return str_pad((string)($id % 1000), 3, '0', STR_PAD_LEFT);
    }
    
    /**
     * Zbuduj ścieżkę shardowaną
     * 
     * @param string $type Typ (avatars, providers, services, reviews)
     * @param int $id ID encji
     * @param string|null $subpath Podkatalog (portfolio, gallery, etc.)
     * @return string Pełna ścieżka
     */
    public static function getShardedPath(string $type, int $id, ?string $subpath = null): string
    {
        $shard = self::getShard($id);
        $path = "{$type}/{$shard}/{$id}";
        
        return $subpath ? "{$path}/{$subpath}" : $path;
    }
}

// Przykłady:
// MediaHelper::getShard(123456) → "456"
// MediaHelper::getShardedPath('avatars', 123456) → "avatars/456/123456"
// MediaHelper::getShardedPath('providers', 789, 'portfolio') → "providers/789/789/portfolio"
```

### 2.3 Zasady Nazewnictwa
- **UUID** dla unikalnych plików (portfolio, galeria)
- **Prefixy funkcyjne** dla konkretnych typów (avatar/main/thumb)
- **Katalogi per ID** dla łatwego usuwania
- **Separacja public/private** dla bezpieczeństwa
- **Sharding 000-999** dla skalowalności filesystem

---

## 3. Service Layer Architecture

### 3.1 Interfejs MediaService
```php
interface MediaServiceInterface
{
    // Upload z automatyczną organizacją
    public function uploadAvatar(User $user, UploadedFile $file): string;
    public function uploadPortfolio(Provider $provider, UploadedFile $file): string;
    public function uploadServicePhoto(Service $service, UploadedFile $file, bool $isMain = false): string;
    public function uploadReviewPhoto(Review $review, UploadedFile $file): string;
    
    // Pobieranie URL (działa lokalnie i w chmurze)
    public function getUrl(string $path, string $size = 'original'): string;
    
    // Usuwanie z oczyszczaniem
    public function deleteUserMedia(int $userId): bool;
    public function deleteProviderMedia(int $providerId): bool;
    public function deleteServiceMedia(int $serviceId): bool;
    public function deleteReviewMedia(int $reviewId): bool;
    
    // Optymalizacja
    public function optimize(string $path): bool;
    public function generateThumbs(string $path): array;
}
```

### 3.2 Implementacja Lokalna (LocalMediaService)
```php
class LocalMediaService implements MediaServiceInterface
{
    protected string $disk = 'public';
    protected array $sizes = [
        'avatar' => ['large' => 512, 'medium' => 256, 'thumb' => 128],
        'portfolio' => ['large' => 1200, 'thumb' => 400],
        'service' => ['large' => 1200, 'medium' => 800, 'thumb' => 400],
        'review' => ['large' => 1200, 'thumb' => 400],
    ];
    
    public function uploadAvatar(User $user, UploadedFile $file): string
    {
        $dir = MediaHelper::getShardedPath('avatars', $user->id);
        Storage::disk($this->disk)->deleteDirectory($dir); // Usuń stare
        
        // Upload oryginału
        $path = Storage::disk($this->disk)->putFileAs(
            $dir, 
            $file, 
            'original.' . $file->extension()
        );
        
        // Generuj rozmiary
        $this->generateAvatarSizes($path, $dir);
        
        return $path;
    }
    
    protected function generateAvatarSizes(string $originalPath, string $dir): void
    {
        $img = Image::make(Storage::disk($this->disk)->path($originalPath));
        
        foreach ($this->sizes['avatar'] as $name => $size) {
            $img->fit($size, $size)
                ->save(Storage::disk($this->disk)->path("{$dir}/{$name}.jpg"), 85);
        }
    }
    
    public function deleteUserMedia(int $userId): bool
    {
        $dir = MediaHelper::getShardedPath('avatars', $userId);
        return Storage::disk($this->disk)->deleteDirectory($dir);
    }
}
```

### 3.3 Implementacja Chmurowa (CloudMediaService)
```php
class CloudMediaService implements MediaServiceInterface
{
    protected string $disk = 's3'; // lub 'cloudflare-r2'
    protected string $cdn = 'https://cdn.localservices.pl';
    
    public function uploadAvatar(User $user, UploadedFile $file): string
    {
        // Prefiks z user_id dla łatwej organizacji
        $path = "users/{$user->id}/avatar/" . Str::uuid() . '.' . $file->extension();
        
        Storage::disk($this->disk)->put($path, file_get_contents($file->path()), [
            'visibility' => 'public',
            'CacheControl' => 'max-age=31536000',
            'ContentType' => $file->getMimeType(),
        ]);
        
        // Wywołaj Cloud Function do generowania thumbów (async)
        dispatch(new GenerateThumbnailsJob($path, 'avatar'));
        
        return $path;
    }
    
    public function getUrl(string $path, string $size = 'original'): string
    {
        if ($size !== 'original') {
            $path = $this->transformPathForSize($path, $size);
        }
        
        // CloudFlare Images transform on-the-fly
        return "{$this->cdn}/{$path}";
    }
    
    public function deleteUserMedia(int $userId): bool
    {
        // S3/R2 obsługuje prefix deletion
        $files = Storage::disk($this->disk)->allFiles("users/{$userId}");
        return Storage::disk($this->disk)->delete($files);
    }
}
```

---

## 4. Migracja Lokalna → Chmura

### 4.1 Strategia Migracji
**Podejście:** Lazy migration (migruj w locie + batch job)

```php
class CloudMigrationService
{
    public function migrateUserMedia(User $user): void
    {
        $localPath = "avatars/{$user->id}";
        $cloudPath = "users/{$user->id}/avatar";
        
        // Upload do chmury
        $files = Storage::disk('public')->allFiles($localPath);
        foreach ($files as $file) {
            $content = Storage::disk('public')->get($file);
            $newPath = str_replace($localPath, $cloudPath, $file);
            
            Storage::disk('s3')->put($newPath, $content, ['visibility' => 'public']);
        }
        
        // Update bazy danych
        $user->update([
            'avatar' => $cloudPath . '/original.jpg',
            'avatar_migrated' => true,
        ]);
        
        // Opcjonalnie: usuń lokalne (po weryfikacji)
        // Storage::disk('public')->deleteDirectory($localPath);
    }
    
    public function migrateAllMedia(): void
    {
        // Batch job
        User::whereNull('avatar_migrated')
            ->chunk(100, function ($users) {
                foreach ($users as $user) {
                    $this->migrateUserMedia($user);
                }
            });
    }
}
```

### 4.2 Adapter Pattern (Seamless Switch)
```php
// config/media.php
return [
    'driver' => env('MEDIA_DRIVER', 'local'), // local | cloud
    'drivers' => [
        'local' => [
            'disk' => 'public',
            'url' => env('APP_URL') . '/storage',
        ],
        'cloud' => [
            'disk' => 's3',
            'cdn' => env('CDN_URL'),
        ],
    ],
];

// app/Providers/AppServiceProvider.php
public function register()
{
    $this->app->bind(MediaServiceInterface::class, function ($app) {
        $driver = config('media.driver');
        
        return match($driver) {
            'cloud' => new CloudMediaService(),
            default => new LocalMediaService(),
        };
    });
}
```

---

## 5. Database Schema Updates

### 5.1 Migracja: Media Tracking
```php
// 2025_12_23_create_media_table.php
Schema::create('media', function (Blueprint $table) {
    $table->id();
    $table->uuid('uuid')->unique();
    $table->morphs('mediable'); // Polymorphic (User, Service, Review)
    $table->string('collection'); // avatar, portfolio, service_gallery, review
    $table->string('disk'); // public, s3
    $table->string('path');
    $table->string('filename');
    $table->string('mime_type');
    $table->unsignedBigInteger('size');
    $table->json('metadata')->nullable(); // width, height, sizes
    $table->unsignedInteger('order')->default(0); // Dla galerii
    $table->boolean('is_migrated')->default(false);
    $table->timestamp('migrated_at')->nullable();
    $table->timestamps();
    $table->softDeletes();
    
    $table->index(['mediable_type', 'mediable_id', 'collection']);
});
```

### 5.2 Model Media (Spatie-like)
```php
class Media extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $fillable = [
        'uuid', 'mediable_type', 'mediable_id', 'collection',
        'disk', 'path', 'filename', 'mime_type', 'size', 'metadata', 'order'
    ];
    
    protected $casts = [
        'metadata' => 'array',
        'is_migrated' => 'boolean',
        'migrated_at' => 'datetime',
    ];
    
    public function mediable(): MorphTo
    {
        return $this->morphTo();
    }
    
    public function getUrl(string $size = 'original'): string
    {
        return app(MediaServiceInterface::class)->getUrl($this->path, $size);
    }
}

// Trait do dodania w User, Service, Review
trait HasMedia
{
    public function media(): MorphMany
    {
        return $this->morphMany(Media::class, 'mediable');
    }
    
    public function addMedia(UploadedFile $file, string $collection): Media
    {
        $service = app(MediaServiceInterface::class);
        
        $path = match($collection) {
            'avatar' => $service->uploadAvatar($this, $file),
            'portfolio' => $service->uploadPortfolio($this, $file),
            'service_gallery' => $service->uploadServicePhoto($this, $file),
            'review' => $service->uploadReviewPhoto($this, $file),
        };
        
        return $this->media()->create([
            'uuid' => Str::uuid(),
            'collection' => $collection,
            'disk' => config('media.driver') === 'cloud' ? 's3' : 'public',
            'path' => $path,
            'filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ]);
    }
    
    public function getAvatar(): ?string
    {
        return $this->media()->where('collection', 'avatar')->first()?->getUrl('medium');
    }
}
```

---

## 6. Automatyczne Czyszczenie (Observers)

### 6.1 User Observer
```php
class UserObserver
{
    public function deleting(User $user): void
    {
        // Soft delete - zachowaj pliki 30 dni
        if ($user->isForceDeleting()) {
            app(MediaServiceInterface::class)->deleteUserMedia($user->id);
            $user->media()->delete(); // Soft delete records
        }
    }
}
```

### 6.2 Scheduled Cleanup
```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule): void
{
    // Usuń soft-deleted media po 30 dniach
    $schedule->call(function () {
        Media::onlyTrashed()
            ->where('deleted_at', '<', now()->subDays(30))
            ->chunk(100, function ($mediaFiles) {
                foreach ($mediaFiles as $media) {
                    Storage::disk($media->disk)->delete($media->path);
                    $media->forceDelete();
                }
            });
    })->daily();
    
    // Usuń pliki temp starsze niż 24h
    $schedule->call(function () {
        Storage::disk('public')->deleteDirectory('temp/uploads');
    })->daily();
}
```

---

## 7. Image Optimization (Intervention Image)

### 7.1 Instalacja
```bash
composer require intervention/image
```

### 7.2 Middleware do Serwowania
```php
// app/Http/Middleware/OptimizeImages.php
class OptimizeImages
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);
        
        if ($request->is('storage/*') && str_ends_with($request->path(), ['.jpg', '.jpeg', '.png'])) {
            // Add cache headers
            $response->headers->set('Cache-Control', 'public, max-age=31536000');
        }
        
        return $response;
    }
}
```

---

## 8. Plan Implementacji (4h)

### Faza 1: Fundament (1.5h)
- [ ] Stwórz `app/Services/Media/MediaServiceInterface.php`
- [ ] Stwórz `app/Services/Media/LocalMediaService.php`
- [ ] Dodaj config `config/media.php`
- [ ] Bind w AppServiceProvider
- [ ] Migracja `create_media_table`
- [ ] Model `Media` + trait `HasMedia`

### Faza 2: Refaktor Istniejących (1h)
- [ ] Zaktualizuj `SettingsController::uploadLogo()` do użycia MediaService
- [ ] Dodaj `User::addMedia()` w miejsce bezpośredniego Storage
- [ ] Dodaj `User::getAvatar()` helper

### Faza 3: Observers + Cleanup (1h)
- [ ] UserObserver dla automatycznego usuwania
- [ ] ServiceObserver
- [ ] ReviewObserver
- [ ] Scheduled cleanup w Kernel

### Faza 4: Testy (0.5h)
- [ ] Test uploadu avatara
- [ ] Test usuwania użytkownika (cascade media)
- [ ] Test migracji local → cloud (mock)

---

## 9. Przykład Użycia (Po Implementacji)

### 9.1 Upload Avatara
```php
// Przed (obecne - bezpośrednie)
$path = $request->file('logo')->store('avatars', 'public');
$user->update(['avatar' => $path]);

// Po (przez MediaService)
$user->addMedia($request->file('logo'), 'avatar');
// Automatycznie: rozmiary, optymalizacja, tracking w bazie
```

### 9.2 Wyświetlanie
```blade
{{-- Przed --}}
<img src="{{ Storage::url($user->avatar) }}" />

{{-- Po --}}
<img src="{{ $user->getAvatar() }}" />
{{-- Działa lokalnie i w chmurze bez zmian --}}
```

### 9.3 Usuwanie
```php
// Przed (ręczne)
Storage::disk('public')->delete($user->avatar);
$user->update(['avatar' => null]);

// Po (automatyczne przez Observer)
$user->delete();
// Wszystkie media użytkownika soft-deleted
```

---

## 10. CloudFlare R2 Setup (Przyszłość)

### 10.1 Config
```php
// config/filesystems.php
'disks' => [
    'r2' => [
        'driver' => 's3',
        'key' => env('R2_ACCESS_KEY_ID'),
        'secret' => env('R2_SECRET_ACCESS_KEY'),
        'region' => 'auto',
        'bucket' => env('R2_BUCKET'),
        'endpoint' => env('R2_ENDPOINT'),
        'url' => env('R2_PUBLIC_URL'),
        'use_path_style_endpoint' => false,
    ],
],
```

### 10.2 Migracja
```bash
# 1. Zmień .env
MEDIA_DRIVER=cloud
CDN_URL=https://media.localservices.pl

# 2. Uruchom migrację
php artisan media:migrate-to-cloud

# 3. Weryfikuj
php artisan media:verify-migration
```

---

## 11. Koszty (Szacunek)

| Wariant | Miesięczny koszt (10k użytkowników) |
|---------|-------------------------------------|
| **Lokalne** | ~50 PLN (dysk VPS 100GB) |
| **CloudFlare R2** | ~20 PLN (0.015$/GB storage) |
| **AWS S3** | ~100 PLN (standardowy) |

**Rekomendacja:** Start lokalnie → Migracja do R2 po 5k użytkowników

---

## 12. Checklist Pre-Production

- [ ] Skonfiguruj backupy storage/ (rclone → R2/Backblaze)
- [ ] Dodaj rate limiting do uploadów (max 10MB/request, 5 requests/min)
- [ ] Walidacja typów plików (whitelist: jpg, png, webp, pdf dla dokumentów)
- [ ] Skanowanie antywirusowe (ClamAV) dla dokumentów weryfikacji
- [ ] CDN setup (CloudFlare proxy) dla `/storage`
- [ ] Watermarki na zdjęciach portfolio (opcjonalnie)
- [ ] EXIF stripping dla prywatności (GPS, camera model)

---

**Autor:** AI Assistant  
**Review:** Pending  
**Szacowany czas implementacji:** 4-6h (Fazy 1-3)
