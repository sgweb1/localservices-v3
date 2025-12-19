import React, { useState } from 'react';
import { Search } from 'lucide-react';
import type { Location } from '../types/location';
import type { ServiceCategory } from '../types/service';
import { CategorySelect } from './CategorySelect';
import { LocationSelect } from './LocationSelect';

interface AdvancedSearchBarProps {
  categories?: ServiceCategory[];
  locations?: Location[];
  onSearch?: (query: string, category?: string, location?: string) => void;
}

/**
 * Advanced Search Bar - 3-ředowy interfejs do wyszukiwania
 * Używa reusable komponentów CategorySelect i LocationSelect
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
          {/* Location Select */}
          <LocationSelect
            locations={locations}
            selected={selectedLocation}
            onChange={setSelectedLocation}
            placeholder="Gdzie? (np. Warszawa, Kraków)"
            loading={false}
          />

          {/* Category Select */}
          <CategorySelect
            categories={categories}
            selected={selectedCategory}
            onChange={setSelectedCategory}
            placeholder="Wszystkie kategorie"
            loading={false}
          />
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
