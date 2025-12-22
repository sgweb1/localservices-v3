<?php

namespace App\Models;

use App\Enums\UserType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

/**
 * Model użytkownika (Customer lub Provider)
 * 
 * Główna tabela użytkowników w systemie. Każdy użytkownik ma przypisany typ
 * (customer/provider) i może mieć powiązany profil szczegółowy.
 * 
 * System ról (Spatie Permission):
 * - customer: Może rezerwować usługi
 * - provider: Może świadczyć usługi (+ automatycznie customer)
 * - admin: Administrator platformy
 * - super_admin, ops_manager, finance, support: Role panelu administracyjnego
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasRoles, Notifiable, SoftDeletes;

    /**
     * Typy użytkowników.
     */
    public const TYPE_CUSTOMER = 'customer';
    public const TYPE_PROVIDER = 'provider';

    /**
     * Boot model - automatyczne generowanie UUID
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            if (empty($user->uuid)) {
                $user->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'first_name',
        'last_name',
        'email',
        'password',
        'uuid',
        'user_type',
        'phone',
        'avatar',
        'bio',
        'city',
        'address',
        'latitude',
        'longitude',
        'rating_average',
        'rating_count',
        'profile_completion',
        'last_login_at',
        'last_seen_at',
        'current_subscription_plan_id',
        'subscription_expires_at',
        'email_notifications',
        'push_notifications',
        'sms_notifications',
        'analytics_interface_visible',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'user_type' => UserType::class,
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'is_admin' => 'boolean',
            'rating_average' => 'decimal:2',
            'rating_count' => 'integer',
            'profile_completion' => 'integer',
            'last_login_at' => 'datetime',
            'last_seen_at' => 'datetime',
            'subscription_expires_at' => 'datetime',
            'email_notifications' => 'boolean',
            'push_notifications' => 'boolean',
            'sms_notifications' => 'boolean',
            'analytics_interface_visible' => 'boolean',
        ];
    }

    /**
     * Relacja do profilu użytkownika
     */
    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class);
    }

    /**
     * Relacja do profilu providera
     */
    public function providerProfile(): HasOne
    {
        return $this->hasOne(ProviderProfile::class);
    }

    /**
     * Relacja do profilu customera
     */
    public function customerProfile(): HasOne
    {
        return $this->hasOne(CustomerProfile::class);
    }

    /**
     * Relacja do aktywnej subskrypcji providera
     */
    public function subscription(): HasOne
    {
        return $this->hasOne(Subscription::class)->where('status', 'active');
    }

    /**
     * Sprawdza czy użytkownik jest providerem
     * Sprawdza zarówno user_type jak i rolę (Spatie)
     */
    public function isProvider(): bool
    {
        return $this->user_type === UserType::Provider || $this->hasRole('provider');
    }

    /**
     * Sprawdza czy użytkownik jest customerem
     * Sprawdza zarówno user_type jak i rolę (Spatie)
     */
    public function isCustomer(): bool
    {
        return $this->user_type === UserType::Customer || $this->hasRole('customer');
    }

    /**
     * Sprawdza czy użytkownik jest adminem
     */
    public function isAdmin(): bool
    {
        // Sprawdzamy najpierw flagę is_admin (szybsze)
        if ($this->is_admin) {
            return true;
        }

        // Następnie sprawdzamy role (wolniejsze, wymaga relacji)
        return $this->hasAnyRole(['super_admin', 'admin', 'ops_manager', 'finance', 'support']);
    }

    /**
     * Sprawdza czy użytkownik jest online (ostatnia aktywność w ciągu 30 sekund)
     */
    public function isOnline(): bool
    {
        return $this->last_seen_at && $this->last_seen_at->greaterThan(now()->subSeconds(30));
    }

    /**
     * Pobiera aktywny profil (provider lub customer)
     */
    public function getActiveProfile(): ProviderProfile|CustomerProfile|null
    {
        if ($this->isProvider()) {
            return $this->providerProfile;
        }

        if ($this->isCustomer()) {
            return $this->customerProfile;
        }

        return null;
    }

    /**
     * Relacja do rezerwacji jako klient
     */
    public function bookingsAsCustomer(): HasMany
    {
        return $this->hasMany(Booking::class, 'customer_id');
    }

    /**
     * Relacja do rezerwacji jako provider
     */
    public function bookingsAsProvider(): HasMany
    {
        return $this->hasMany(Booking::class, 'provider_id');
    }

    /**
     * Relacja do zapytań ofertowych jako klient
     */
    public function bookingRequestsAsCustomer(): HasMany
    {
        return $this->hasMany(BookingRequest::class, 'customer_id');
    }

    /**
     * Relacja do zapytań ofertowych jako provider
     */
    public function bookingRequestsAsProvider(): HasMany
    {
        return $this->hasMany(BookingRequest::class, 'provider_id');
    }

    /**
     * Recenzje napisane przez tego użytkownika
     */
    public function reviewsGiven(): HasMany
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }

    /**
     * Recenzje na temat tego użytkownika (providera)
     */
    public function reviewsReceived(): HasMany
    {
        return $this->hasMany(Review::class, 'reviewed_id');
    }

    /**
     * Odpowiedzi na recenzje napisane przez tego użytkownika
     */
    public function reviewResponses(): HasMany
    {
        return $this->hasMany(ReviewResponse::class);
    }

    /**
     * Rozmowy jako customer
     */
    public function conversationsAsCustomer(): HasMany
    {
        return $this->hasMany(Conversation::class, 'customer_id');
    }

    /**
     * Rozmowy jako provider
     */
    public function conversationsAsProvider(): HasMany
    {
        return $this->hasMany(Conversation::class, 'provider_id');
    }

    /**
     * Wszystkie wiadomości wysłane przez tego użytkownika
     */
    public function messagesSent(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    /**
     * Dostępność w dni tygodnia (dla providerów)
     */
    public function availabilities(): HasMany
    {
        return $this->hasMany(Availability::class, 'provider_id');
    }

    /**
     * Wyjątki dostępności (urlop, choroba)
     */
    public function availabilityExceptions(): HasMany
    {
        return $this->hasMany(AvailabilityException::class, 'provider_id');
    }

    /**
     * Obszary serwisu
     */
    public function serviceAreas(): HasMany
    {
        return $this->hasMany(ServiceArea::class, 'provider_id');
    }

    /**
     * Weryfikacje (tożsamość, bank, telefon)
     */
    public function verifications(): HasMany
    {
        return $this->hasMany(Verification::class);
    }

    /**
     * Certyfikaty zawodowe
     */
    public function certifications(): HasMany
    {
        return $this->hasMany(Certification::class);
    }

    /**
     * Elementy portfolio
     */
    public function portfolioItems(): HasMany
    {
        return $this->hasMany(PortfolioItem::class);
    }

    /**
     * Subskrypcje
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Płatności
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Faktury
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * Wypłaty (dla providerów)
     */
    public function payouts(): HasMany
    {
        return $this->hasMany(Payout::class);
    }

    /**
     * Oferty usług (service listings) providera
     */
    public function serviceListings(): HasMany
    {
        return $this->hasMany(Service::class, 'provider_id');
    }

    // ==========================================
    // Subskrypcje i funkcje planów
    // ==========================================

    /**
     * Relacja do aktualnego planu (denormalized)
     */
    public function currentPlan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'current_subscription_plan_id');
    }

    /**
     * Aktywny plan z fallbackiem do FREE
     */
    public function getActivePlanAttribute(): ?SubscriptionPlan
    {
        return Cache::remember("user:{$this->id}:active_plan", 300, function () {
            if ($this->current_subscription_plan_id && (! $this->subscription_expires_at || $this->subscription_expires_at->isFuture())) {
                return $this->currentPlan ?: $this->getFreePlan();
            }

            return $this->getFreePlan();
        });
    }

    /**
     * Plan FREE (cache 1h)
     */
    protected function getFreePlan(): ?SubscriptionPlan
    {
        return Cache::remember('subscription_plan:free', 3600, function () {
            return SubscriptionPlan::where('slug', 'free')->first();
        });
    }

    /**
     * Sprawdza dostępność feature na podstawie planu
     */
    public function hasFeature(string $feature): bool
    {
        $plan = $this->activePlan;
        if (! $plan) {
            return false;
        }

        $normalized = Str::snake($feature);
        $features = $plan->features ?? [];

        return in_array($normalized, $features, true)
            || in_array(str_replace('has_', '', $normalized), $features, true);
    }

    /**
     * Pobiera limit dla danego klucza
     */
    public function getLimit(string $limitKey): int
    {
        $plan = $this->activePlan;
        if (! $plan) {
            return 0;
        }

        $limits = ($plan->features['limits'] ?? []);

        return match ($limitKey) {
            'max_listings' => (int) ($limits['max_listings'] ?? $plan->max_services ?? 0),
            'max_service_categories' => (int) ($limits['max_service_categories'] ?? 0),
            default => (int) ($limits[$limitKey] ?? 0),
        };
    }

    /**
     * Informacje o wykorzystaniu limitu
     */
    public function getLimitUsage(string $limitKey): array
    {
        $limit = $this->getLimit($limitKey);
        $current = $this->getCurrentUsage($limitKey);

        $isUnlimited = $limit === -1 || $limit >= 9999;

        return [
            'current' => $current,
            'limit' => $isUnlimited ? null : $limit,
            'remaining' => $isUnlimited ? null : max(0, $limit - $current),
            'percentage' => $isUnlimited ? 0 : ($limit > 0 ? round(($current / $limit) * 100) : 0),
            'is_unlimited' => $isUnlimited,
            'is_exceeded' => ! $isUnlimited && $current > $limit,
        ];
    }

    /**
     * Aktualne użycie limitu
     */
    protected function getCurrentUsage(string $limitKey): int
    {
        return match ($limitKey) {
            'max_listings' => $this->serviceListings()->where('status', 'active')->count(),
            'max_service_categories' => $this->serviceListings()->distinct('category_id')->count('category_id'),
            default => 0,
        };
    }

    /**
     * Zwraca URL avatara z fallbackiem do Gravatar
     */
    public function getAvatarUrlAttribute(): string
    {
        if ($this->avatar) {
            return asset('storage/' . $this->avatar);
        }

        // Fallback do Gravatar
        $hash = md5(strtolower(trim($this->email)));
        return "https://www.gravatar.com/avatar/{$hash}?d=mp&s=200";
    }

    /**
     * Pobiera Trust Score użytkownika (0-100)
     * 
     * Dla providerów: z providerProfile
     * Dla customerów: obliczany na podstawie aktywności
     */
    public function getTrustScore(): int
    {
        if ($this->isProvider() && $this->providerProfile) {
            return $this->providerProfile->trust_score ?? 0;
        }

        // Dla customerów: prosty wskaźnik aktywności
        $score = 20; // Bazowy

        if ($this->email_verified_at) {
            $score += 20;
        }

        // Sprawdź czy ma rezerwacje (customer side)
        if ($this->relationLoaded('bookings') && $this->bookings->count() > 0) {
            $score += 20;
        }

        return min($score, 100);
    }
}
