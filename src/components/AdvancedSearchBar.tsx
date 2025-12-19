import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, MapPin, ChevronDown, Wrench, Zap, Sparkles, Heart, Leaf, Home, Lightbulb, Star } from 'lucide-react';
import type { Location } from '../types/location';
import type { ServiceCategory } from '../types/service';

interface AdvancedSearchBarProps {
  categories?: ServiceCategory[];
  locations?: Location[];
  onSearch?: (query: string, category?: string, location?: string) => void;
}

/**
 * Advanced Search Bar z autocomplete dla kategorii i miast
 * Buduje friendly URL-e oraz wspiera Instant Search
 */
export const AdvancedSearchBar: React.FC<AdvancedSearchBarProps> = ({
  categories = [],
  locations = [],
  onSearch,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  
  // Category Dropdown
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryQuery, setCategoryQuery] = useState('');
  const categoryRef = useRef<HTMLDivElement>(null);
  
  // Location Dropdown
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  const iconMap = useMemo(
    () => ({
      'heroicon-o-wrench': Wrench,
      'heroicon-o-bolt': Zap,
      'heroicon-o-sparkles': Sparkles,
      'heroicon-o-heart': Heart,
      'heroicon-o-leaf': Leaf,
      'heroicon-o-home': Home,
      'heroicon-o-academic-cap': Lightbulb,
      'heroicon-o-star': Star,
    }),
    []
  );

  const resolveIcon = (icon?: string) => {
    if (icon && iconMap[icon as keyof typeof iconMap]) {
      return iconMap[icon as keyof typeof iconMap];
    }
    return Sparkles;
  };

  // Filter categories
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categoryQuery.toLowerCase())
  );

  // Search locations (simulated API call)
  useEffect(() => {
    setLoadingLocations(true);
    const timer = setTimeout(() => {
      const query = locationQuery.trim().toLowerCase();
      const filtered = query
        ? locations.filter((loc) => loc.name.toLowerCase().includes(query))
        : locations;
      setLocationResults(filtered.slice(0, 8));
      setLoadingLocations(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [locationQuery, locations]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setCategoryOpen(false);
      }
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Build friendly URL
  const buildURL = (): string => {
    let url = '/szukaj';
    if (selectedCategory) {
      url += `/${selectedCategory.slug}`;
      if (selectedLocation) {
        url += `/${selectedLocation.slug}`;
      }
    }
    if (query.trim()) {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}q=${encodeURIComponent(query)}`;
    }
    return url;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const url = buildURL();
    if (onSearch) {
      onSearch(query, selectedCategory?.slug, selectedLocation?.slug);
    } else {
      window.location.href = url;
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="space-y-4">
        {/* Row 1: Location + Category (50/50 on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Location Autocomplete */}
          <div ref={locationRef} className="relative">
            <div className="relative h-12">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none z-10" />
              <input
                type="text"
                placeholder="Gdzie? (np. Warszawa, Kraków)"
                value={locationQuery || (selectedLocation?.name ?? '')}
                onChange={(e) => {
                  setLocationQuery(e.target.value);
                  setLocationOpen(true);
                  if (!e.target.value) setSelectedLocation(null);
                }}
                onFocus={() => {
                  if (locationResults.length === 0 && locations.length > 0) {
                    setLocationResults(locations.slice(0, 8));
                  }
                  setLocationOpen(true);
                }}
                className="w-full h-full pl-12 pr-4 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-base transition-colors"
              />
              {selectedLocation && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLocation(null);
                    setLocationQuery('');
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Location Dropdown */}
            {locationOpen && (locationResults.length > 0 || loadingLocations) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg z-50">
                {loadingLocations ? (
                  <div className="p-4 text-center text-gray-500 text-sm">Szukam...</div>
                ) : (
                  <ul className="py-2 max-h-64 overflow-y-auto">
                    {locationResults.map((loc, idx) => (
                      <li key={loc.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLocation(loc);
                            setLocationQuery(loc.name);
                            setLocationOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-900 dark:text-white transition-colors"
                        >
                          <MapPin size={16} className="text-gray-400" />
                          {loc.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Category Select */}
          <div ref={categoryRef} className="relative">
            <button
              type="button"
              onClick={() => setCategoryOpen(!categoryOpen)}
              className="w-full h-12 flex items-center justify-between gap-3 px-5 border border-gray-300 dark:border-gray-700 rounded-full bg-white dark:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <span className="text-gray-600 dark:text-gray-300 text-base">
                {selectedCategory?.name ?? 'Wszystkie kategorie'}
              </span>
              <ChevronDown
                size={20}
                className={`text-gray-400 transition-transform duration-200 ${
                  categoryOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Category Dropdown */}
            {categoryOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg z-50 w-full min-w-48">
                <div className="p-2">
                  <input
                    type="text"
                    placeholder="Szukaj kategorii..."
                    value={categoryQuery}
                    onChange={(e) => setCategoryQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <ul className="py-2 max-h-64 overflow-y-auto">
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory(null);
                        setCategoryOpen(false);
                        setCategoryQuery('');
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors text-sm flex items-center gap-3"
                    >
                      <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">*</span>
                      <span>Wszystkie kategorie</span>
                    </button>
                  </li>
                  {filteredCategories.map((cat) => {
                    const Icon = resolveIcon(cat.icon ?? undefined);
                    return (
                    <li key={cat.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat);
                          setCategoryOpen(false);
                          setCategoryQuery('');
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors text-sm flex items-center gap-3"
                      >
                        <span className="w-8 h-8 rounded-full bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                        </span>
                        <span>{cat.name}</span>
                      </button>
                    </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Search Query (Full Width) */}
        <div className="relative h-12">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none z-10" />
          <input
            type="text"
            placeholder="Czego szukasz? (np. hydraulik, opiekunka)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-full pl-12 pr-4 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-base transition-colors"
          />
        </div>

        {/* Row 3: Submit Button (Centered) */}
        <div className="flex justify-center pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 w-full md:w-64 justify-center"
          >
            <Search size={20} />
            <span>Szukaj</span>
          </button>
        </div>

        {/* URL Preview (dev only) */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          URL: {buildURL()}
        </div>
      </form>
    </div>
  );
};
