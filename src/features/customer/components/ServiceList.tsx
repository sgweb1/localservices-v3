import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Search, Filter, MapPin, Star, Sparkles, X, ShieldCheck, Zap, SortAsc, Compass, Map, Navigation, Heart, Menu } from 'lucide-react';
import { useGeolocation } from '../../../hooks/useGeolocation';
import { useLocations } from '../../../hooks/useLocations';
import { useCategories } from '../../../hooks/useCategories';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { CategorySelect } from '../../../components/CategorySelect';
import { LocationSelect } from '../../../components/LocationSelect';
import { Switch } from '../../../components/ui/switch';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Slider } from '../../../components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { Spinner } from '../../../components/ui/spinner';
import { Skeleton } from '../../../components/ui/skeleton';
import { useServices } from '../hooks/useServices';
import { ServiceCard } from './ServiceCard';
import { ServiceMap } from '../../../components/map/ServiceMap';
import { ServiceDetailsDialog } from './ServiceDetailsDialog';
import { Service } from '../../../types/service';
import type { ServiceCategory } from '../../../types/service';
import type { Location } from '../../../types/location';

/**
 * ServiceFilter - Komponent filtru usług
 */
const ServiceFilter: React.FC<{
  onFilterChange: (filters: Record<string, any>) => void;
  initialFilters: Record<string, any>;
}> = ({ onFilterChange, initialFilters }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [ratingMin, setRatingMin] = useState<number>(0);
  const [trustMin, setTrustMin] = useState<number>(0);
  const [instantOnly, setInstantOnly] = useState(false);
  const [sort, setSort] = useState('newest');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sliderDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { getCurrentPosition, loading: geoLoading } = useGeolocation();
  const { locations, loading: locationsLoading } = useLocations();
  const { categories, loading: categoriesLoading } = useCategories();

  useEffect(() => {
    // Find category by slug if provided
    if (initialFilters.category && categories.length > 0) {
      const cat = categories.find((c) => c.slug === initialFilters.category);
      setSelectedCategory(cat ?? null);
    }
    // Find location by id if provided
    if (initialFilters.location_id && locations.length > 0) {
      const loc = locations.find((l) => l.id === initialFilters.location_id);
      setSelectedLocation(loc ?? null);
    }
    setSearch(initialFilters.search ?? '');
    setMinPrice(initialFilters.min_price?.toString() ?? '');
    setMaxPrice(initialFilters.max_price?.toString() ?? '');
    setRatingMin(initialFilters.rating_min ?? 0);
    setTrustMin(initialFilters.trust_min ?? 0);
    setInstantOnly(initialFilters.instant_only ?? false);
    setSort(initialFilters.sort ?? 'newest');
  }, [initialFilters, categories, locations]);

  const emitFilters = (closePanel = false) => {
    onFilterChange({
      category: selectedCategory?.slug || undefined,
      location_id: selectedLocation?.id || undefined,
      search: search || undefined,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
      rating_min: ratingMin || undefined,
      trust_min: trustMin || undefined,
      instant_only: instantOnly || undefined,
      sort: sort || undefined,
    });
    if (closePanel) {
      setIsOpen(false);
    }
  };

  const handleApply = () => emitFilters(true);

  const applyPreset = (preset: 'top-rated' | 'budget' | 'instant' | 'nearby') => {
    if (preset === 'top-rated') {
      setSearch('polecany');
      setRatingMin(4.5);
    }
    if (preset === 'budget') {
      setSearch('tanie usługi');
      setMaxPrice('150');
    }
    if (preset === 'instant') {
      setInstantOnly(true);
      setSearch('express');
    }
    if (preset === 'nearby') {
      // Ustaw pierwszą główną lokalizację (Warszawa)
      const mainCity = locations.find((l) => l.name === 'Warszawa' || l.is_major_city);
      if (mainCity) setLocationId(mainCity.id);
    }
    setIsOpen(true);
  };

  const handleUseLocation = async () => {
    try {
      const coords = await getCurrentPosition();
      // Mock reverse geocoding - w prawdziwej aplikacji użyj API
      const mainCity = locations.find((l) => l.name === 'Warszawa' || l.is_major_city);
      if (mainCity) {
        setLocationId(mainCity.id);
        emitFilters(false);
      }
    } catch (err) {
      console.error('Błąd geolokalizacji:', err);
    }
  };

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => emitFilters(false), 350);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search]);

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
          <Input
            type="text"
            placeholder="Szukaj: hydraulik, elektryk, firma..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                emitFilters(false);
              }
            }}
            className="pl-11 h-12 text-base shadow-sm"
          />
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="md"
          className="px-4 sm:px-5 py-3 rounded-xl gap-2 shadow-sm"
          data-testid="filters-open"
        >
          <Filter size={18} />
          <span className="hidden sm:inline">Filtry</span>
        </Button>
        <Button
          onClick={handleApply}
          variant="primary"
          size="md"
          className="px-4 sm:px-5 py-3 rounded-xl gap-2 shadow-md"
          data-testid="filters-apply"
        >
          <Sparkles size={18} />
          <span className="hidden sm:inline">Zastosuj</span>
          <span className="sm:hidden">OK</span>
        </Button>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => applyPreset('top-rated')}
          className="px-4 py-2 rounded-full text-sm font-semibold bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-200 hover:bg-cyan-200 dark:hover:bg-cyan-900/60 transition-all"
        >
          <Star className="w-4 h-4 inline mr-2" /> Najlepiej oceniani
        </button>
        <button
          onClick={() => applyPreset('budget')}
          className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-all"
        >
          Budżetowe
        </button>
        <button
          onClick={() => applyPreset('instant')}
          className="px-4 py-2 rounded-full text-sm font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-all"
        >
          Express / Instant
        </button>
        <button
          onClick={() => applyPreset('nearby')}
          className="px-4 py-2 rounded-full text-sm font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-all"
        >
          Najbliżej mnie
        </button>
      </div>
    </div>

    {/* Filter Panel */}
    {isOpen && (
      <div className="bg-white/90 dark:bg-gray-950/90 border border-gray-200 dark:border-gray-600 rounded-2xl p-4 sm:p-6 mb-4 backdrop-blur-xl shadow-[0_12px_40px_rgba(6,182,212,0.12)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Location Select */}
            <div>
              <Label className="mb-2 block">Miasto</Label>
              <LocationSelect
                locations={locations}
                selected={selectedLocation}
                onChange={setSelectedLocation}
                placeholder="Wybierz miasto"
                loading={locationsLoading}
              />
            </div>

            {/* Category Select */}
            <div>
              <Label className="mb-2 block">Kategoria</Label>
              <CategorySelect
                categories={categories}
                selected={selectedCategory}
                onChange={setSelectedCategory}
                placeholder="Wszystkie"
                loading={categoriesLoading}
              />
            </div>

            {/* Price min */}
            <div>
              <Label className="mb-2 block">Cena min (PLN)</Label>
              <Input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                className="h-12 text-base"
              />
            </div>

            {/* Price max */}
            <div>
              <Label className="mb-2 block">Cena max (PLN)</Label>
              <Input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="500"
                className="h-12 text-base"
              />
            </div>

            {/* Rating */}
            <div>
              <Label className="mb-2 block">Minimalna ocena</Label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[ratingMin]}
                  onValueChange={(value) => {
                    setRatingMin(value[0] ?? 0);
                    if (sliderDebounceRef.current) clearTimeout(sliderDebounceRef.current);
                    sliderDebounceRef.current = setTimeout(() => emitFilters(false), 500);
                  }}
                  min={0}
                  max={5}
                  step={0.5}
                  className="w-full"
                />
                <span className="w-10 text-sm font-semibold text-gray-700 dark:text-gray-200">{ratingMin.toFixed(1)}</span>
              </div>
            </div>

            {/* Trust Score */}
            <div>
              <Label className="mb-2 block">Trust Score</Label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[trustMin]}
                  onValueChange={(value) => {
                    setTrustMin(value[0] ?? 0);
                    if (sliderDebounceRef.current) clearTimeout(sliderDebounceRef.current);
                    sliderDebounceRef.current = setTimeout(() => emitFilters(false), 500);
                  }}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <span className="w-12 text-sm font-semibold text-gray-700 dark:text-gray-200">{trustMin}%</span>
              </div>
            </div>

            {/* Geolocation Button */}
            <div className="flex items-end">
              <Button
                onClick={handleUseLocation}
                disabled={geoLoading}
                variant="secondary"
                className="w-full gap-2"
                size="md"
              >
                <Navigation className="w-4 h-4" />
                {geoLoading ? 'Pobieranie...' : 'Moja lokalizacja'}
              </Button>
            </div>

            {/* Instant */}
            <div className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
              <div>
                <Label className="block">Instant / ekspres</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Tylko oferty z natychmiastową akceptacją</p>
              </div>
              <Switch checked={instantOnly} onCheckedChange={(v) => setInstantOnly(v)} />
            </div>

            {/* Action */}
            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <Button
                onClick={handleApply}
                className="w-full"
                size="md"
                variant="primary"
                data-testid="filters-apply-bottom"
              >
                Zastosuj filtry
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * ServiceList - Lista usług z paginacją i filtrami
 */
const ServiceListComponent: React.FC = () => {
  const { services, loading, error, pagination, fetchServices } = useServices();
  const { category: categoryParam, city: citySlug } = useParams<{ category?: string; city?: string }>();
  const navigate = useNavigate();
  const { locations } = useLocations();
  const [filters, setFilters] = useState<Record<string, any>>({});
  const didInit = useRef(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [isAppending, setIsAppending] = useState(false);
  const [showMap, setShowMap] = useState(() => {
    const saved = localStorage.getItem('serviceListViewMode');
    return saved === 'map';
  });
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem('favoriteServices');
    return saved ? JSON.parse(saved) : [];
  });
  const [showFavorites, setShowFavorites] = useState(false);

  const syncToUrlAndPath = useCallback((next: Record<string, any>, page: number) => {
    // SEO-friendly path: /szukaj/:category/:city
    let path = '/szukaj';
    if (next.category) {
      path += `/${next.category}`;
      if (next.location_id) {
        const location = locations.find((l) => l.id === next.location_id);
        if (location) {
          path += `/${location.slug}`;
        }
      }
    }

    // Query params dla pozostałych filtrów
    const params = new URLSearchParams();
    if (next.search) params.set('q', next.search);
    if (next.min_price !== undefined) params.set('pmin', String(next.min_price));
    if (next.max_price !== undefined) params.set('pmax', String(next.max_price));
    if (next.rating_min !== undefined) params.set('rmin', String(next.rating_min));
    if (next.trust_min !== undefined) params.set('tmin', String(next.trust_min));
    if (next.instant_only !== undefined) params.set('instant', next.instant_only ? '1' : '0');
    if (next.sort) params.set('sort', next.sort);
    if (page > 1) params.set('page', String(page));
    
    const query = params.toString();
    const url = path + (query ? `?${query}` : '');
    navigate(url, { replace: true });
  }, [locations, navigate]);

  // Initial load from URL params + query string
  React.useEffect(() => {
    if (didInit.current || locations.length === 0) {
      return;
    }
    didInit.current = true;

    const params = new URLSearchParams(window.location.search);
    const initial: Record<string, any> = {
      category: categoryParam || undefined,
      search: params.get('q') || undefined,
      min_price: params.get('pmin') ? Number(params.get('pmin')) : undefined,
      max_price: params.get('pmax') ? Number(params.get('pmax')) : undefined,
      rating_min: params.get('rmin') ? Number(params.get('rmin')) : undefined,
      trust_min: params.get('tmin') ? Number(params.get('tmin')) : undefined,
      instant_only: params.get('instant') === '1' ? true : undefined,
      sort: params.get('sort') || undefined,
    };

    // Konwersja city slug -> location_id
    if (citySlug) {
      const location = locations.find((l) => l.slug === citySlug);
      if (location) {
        initial.location_id = location.id;
      }
    }

    const page = params.get('page') ? Number(params.get('page')) : 1;
    setFilters(initial);
    fetchServices(page, initial);
  }, [fetchServices, categoryParam, citySlug, locations]);

  const handleFilterChange = useCallback((newFilters: Record<string, any>) => {
    setFilters(newFilters);
    syncToUrlAndPath(newFilters, 1);
    fetchServices(1, newFilters);
  }, [fetchServices, syncToUrlAndPath]);

  const clearFilters = () => {
    setFilters({});
    syncToUrlAndPath({}, 1);
    fetchServices(1, {});
  };

  const removeFilter = (key: string) => {
    const updated = { ...filters };
    delete updated[key];
    setFilters(updated);
    syncToUrlAndPath(updated, 1);
    fetchServices(1, updated);
  };

  const handleLoadMore = useCallback(() => {
    if (loading || isAppending) {
      return;
    }
    if (pagination.current_page >= pagination.last_page) {
      return;
    }
    setIsAppending(true);
    const nextPage = pagination.current_page + 1;
    syncToUrlAndPath(filters, nextPage);
    fetchServices(nextPage, filters, { append: true }).finally(() => setIsAppending(false));
  }, [filters, fetchServices, isAppending, loading, pagination.current_page, pagination.last_page, syncToUrlAndPath]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting) {
        handleLoadMore();
      }
    }, { threshold: 1 });

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [handleLoadMore]);

  useEffect(() => {
    localStorage.setItem('serviceListViewMode', showMap ? 'map' : 'list');
  }, [showMap]);

  useEffect(() => {
    localStorage.setItem('favoriteServices', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (serviceId: number) => {
    setFavorites((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-3xl mx-auto mt-6">
        <AlertTitle>Nie udało się pobrać usług</AlertTitle>
        <AlertDescription className="flex items-center gap-3">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => fetchServices(1, filters)}>
            Spróbuj ponownie
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const favoriteServices = services.filter((s) => favorites.includes(s.id));

  return (
    <div className="max-w-7xl mx-auto relative">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2 font-archivo">
            Znajdź specjalistę
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
            Wyniki: <span className="font-bold text-primary-600 dark:text-primary-400">{pagination.total}</span> ofert w Twojej okolicy
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowFavorites(!showFavorites)}
          className="relative"
          data-testid="favorites-toggle"
        >
          <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
          {favorites.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {favorites.length}
            </span>
          )}
        </Button>
      </div>

      {/* Favorites Sidebar */}
      {showFavorites && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-700 shadow-2xl z-50 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ulubione</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowFavorites(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="p-4 space-y-3">
            {favoriteServices.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">Brak ulubionych usług</p>
              </div>
            ) : (
              favoriteServices.map((service) => (
                <div
                  key={service.id}
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors"
                  onClick={() => setSelectedService(service)}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                        {service.name || 'Bez nazwy'}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                        {service.city}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(service.id);
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                  <div className="text-sm font-bold text-primary-600 dark:text-primary-400">
                    {service.base_price} zł
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Backdrop for sidebar */}
      {showFavorites && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setShowFavorites(false)}
        />
      )}

      {/* Map View Toggle */}
      <div className="mb-4 flex items-center justify-end gap-2">
        <Button
          variant={showMap ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setShowMap(true)}
          className="gap-2"
          data-testid="view-map"
        >
          <Map className="w-4 h-4" /> Mapa
        </Button>
        <Button
          variant={!showMap ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setShowMap(false)}
          className="gap-2"
          data-testid="view-list"
        >
          Lista
        </Button>
      </div>

      {/* Map preview */}
      {showMap && services.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <Card className="overflow-hidden border border-cyan-100/60 dark:border-cyan-900/40 shadow-[0_10px_35px_rgba(6,182,212,0.14)]">
            <ServiceMap
              key="service-map"
              services={services}
              center={[52.2297, 21.0122]}
              zoom={12}
              onServiceClick={(service) => setSelectedService(service)}
            />
          </Card>
        </div>
      )}

      {/* Active filters */}
      {(filters.category || filters.location_id || filters.search || filters.min_price !== undefined || filters.max_price !== undefined || filters.rating_min !== undefined || filters.trust_min !== undefined || filters.instant_only || filters.sort) && (
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          {filters.location_id && (
            <Badge variant="primary" className="flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {locations.find((l) => l.id === filters.location_id)?.name || 'Miasto'}
              <button onClick={() => removeFilter('location_id')} className="hover:text-primary-700 dark:hover:text-primary-200">
                <X className="w-4 h-4" />
              </button>
            </Badge>
          )}
          {filters.category && (
            <Badge variant="neutral" className="flex items-center gap-1">
              {filters.category}
              <button onClick={() => removeFilter('category')} className="hover:text-gray-900 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </Badge>
          )}
          {filters.search && (
            <Badge variant="neutral" className="flex items-center gap-1">
              {filters.search}
              <button onClick={() => removeFilter('search')} className="hover:text-gray-900 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </Badge>
          )}
          {filters.min_price !== undefined && (
            <Badge variant="neutral" className="flex items-center gap-1">
              od {filters.min_price} zł
              <button onClick={() => removeFilter('min_price')} className="hover:text-gray-900 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </Badge>
          )}
          {filters.max_price !== undefined && (
            <Badge variant="neutral" className="flex items-center gap-1">
              do {filters.max_price} zł
              <button onClick={() => removeFilter('max_price')} className="hover:text-gray-900 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </Badge>
          )}
          {filters.rating_min !== undefined && (
            <Badge variant="neutral" className="flex items-center gap-1">
              <Star className="w-4 h-4" /> {filters.rating_min}+
              <button onClick={() => removeFilter('rating_min')} className="hover:text-gray-900 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </Badge>
          )}
          {filters.trust_min !== undefined && (
            <Badge variant="neutral" className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Trust {filters.trust_min}%+
              <button onClick={() => removeFilter('trust_min')} className="hover:text-gray-900 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </Badge>
          )}
          {filters.instant_only && (
            <Badge variant="primary" className="flex items-center gap-1">
              <Zap className="w-4 h-4" /> Instant
              <button onClick={() => removeFilter('instant_only')} className="hover:text-primary-700 dark:hover:text-primary-200">
                <X className="w-4 h-4" />
              </button>
            </Badge>
          )}
          {filters.sort && (
            <Badge variant="neutral" className="flex items-center gap-1">
              <SortAsc className="w-4 h-4" /> {filters.sort}
              <button onClick={() => removeFilter('sort')} className="hover:text-gray-900 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </Badge>
          )}
          <Button onClick={clearFilters} variant="ghost" size="sm" className="px-2 text-sm underline">
            Wyczyść filtry
          </Button>
        </div>
      )}

      {/* Filter */}
      <ServiceFilter onFilterChange={handleFilterChange} initialFilters={filters} />

      {/* Loading State */}
      {loading && services.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="space-y-3">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Services Grid */}
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {services.map((service) => (
            <Card key={service.id} className="p-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <ServiceCard
                  service={service}
                  onClick={(s) => setSelectedService(s)}
                  isFavorite={favorites.includes(service.id)}
                  onToggleFavorite={toggleFavorite}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {services.length === 0 && !loading && (
          <div className="text-center py-16 sm:py-24">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Search className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 font-archivo">
                Nie znaleziono usług
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Spróbuj zmienić filtry lub szukaj w innej lokalizacji
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={clearFilters} variant="outline" className="gap-2">
                  <X className="w-4 h-4" />
                  Wyczyść filtry
                </Button>
                <Button variant="primary" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Dodaj ogłoszenie
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={loadMoreRef} className="flex justify-center items-center py-6">
          {(loading && services.length > 0) || isAppending ? (
            <Spinner size="lg" />
          ) : pagination.current_page < pagination.last_page ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">Przewiń, aby wczytać więcej...</div>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400">To już wszystkie wyniki</div>
          )}
        </div>
      </>

      {/* Service Details Dialog */}
      <ServiceDetailsDialog
        service={selectedService}
        open={selectedService !== null}
        onClose={() => setSelectedService(null)}
      />
    </div>
  );
};

export const ServiceList: React.FC = () => {
  return <ServiceListComponent />;
};
