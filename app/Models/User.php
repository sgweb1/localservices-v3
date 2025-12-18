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
     * Sprawdza czy użytkownik jest online (ostatnia aktywność w ciągu 5 minut)
     */
    public function isOnline(): bool
    {
        return $this->last_seen_at && $this->last_seen_at->greaterThan(now()->subMinutes(5));
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
}
