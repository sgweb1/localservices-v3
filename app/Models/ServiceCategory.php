<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * Model kategorii usług z obsługą hierarchii parent/child.
 *
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property string|null $icon
 * @property int|null $parent_id
 * @property int $order
 * @property bool $is_active
 * @property-read ServiceCategory|null $parent
 * @property-read \Illuminate\Database\Eloquent\Collection|ServiceCategory[] $children
 * @property-read \Illuminate\Database\Eloquent\Collection|Service[] $services
 */
class ServiceCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'parent_id',
        'name',
        'slug',
        'description',
        'icon',
        'image',
        'meta_title',
        'meta_description',
        'color',
        'order',
        'is_active',
        'is_featured',
        'listings_count',
        'providers_count',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'order' => 'integer',
        'parent_id' => 'integer',
        'listings_count' => 'integer',
        'providers_count' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
        });

        static::updating(function ($category) {
            if ($category->isDirty('name') && ! $category->isDirty('slug')) {
                $category->slug = Str::slug($category->name);
            }
        });
    }

    /**
     * Relacja do kategorii nadrzędnej.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'parent_id');
    }

    /**
     * Relacja do kategorii podrzędnych.
     */
    public function children(): HasMany
    {
        return $this->hasMany(ServiceCategory::class, 'parent_id')->orderBy('order');
    }

    /**
     * Relacja do ofert usług w tej kategorii.
     */
    public function services(): HasMany
    {
        return $this->hasMany(Service::class, 'category_id');
    }

    /**
     * Scope dla kategorii głównych (bez rodzica).
     */
    public function scopeParent($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope dla kategorii podrzędnych.
     */
    public function scopeChildren($query)
    {
        return $query->whereNotNull('parent_id');
    }

    /**
     * Scope dla aktywnych kategorii.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope sortujący według kolejności.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order')->orderBy('name');
    }
}
