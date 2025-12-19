import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import type { Location } from '../types/location';

interface LocationSelectProps {
  /** Lista dostępnych lokalizacji */
  locations: Location[];
  /** Wybrana lokalizacja */
  selected: Location | null;
  /** Callback gdy się zmieni wybór */
  onChange: (location: Location | null) => void;
  /** Placeholder tekst */
  placeholder?: string;
  /** Czy loading */
  loading?: boolean;
}

/**
 * LocationSelect - Reusable komponent do wyboru lokalizacji
 * Wspiera autocomplete i preload na focus
 * Używany w: AdvancedSearchBar, ServiceFilter, etc.
 */
export const LocationSelect: React.FC<LocationSelectProps> = ({
  locations,
  selected,
  onChange,
  placeholder = 'Wybierz miasto',
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Search locations
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(() => {
      const q = query.trim().toLowerCase();
      const filtered = q
        ? locations.filter((loc) => loc.name.toLowerCase().includes(q))
        : locations;
      setResults(filtered.slice(0, 12));
      setIsSearching(false);
    }, 150);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, locations]);

  // Preload on focus
  const handleOpenDropdown = () => {
    setIsOpen(true);
    if (!query) {
      setResults(locations.slice(0, 12));
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      {/* Button */}
      <button
        onClick={handleOpenDropdown}
        disabled={loading}
        className="w-full h-11 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm px-3 py-2 flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
      >
        <span className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <span className={selected ? '' : 'text-gray-500 dark:text-gray-400'}>
            {selected?.name ?? placeholder}
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50">
          {/* Search */}
          <input
            type="text"
            placeholder="Szukaj miasta..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-t-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
            autoFocus
          />

          {/* Options */}
          <div className="max-h-60 overflow-y-auto">
            {/* All option */}
            <button
              onClick={() => {
                onChange(null);
                setIsOpen(false);
                setQuery('');
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white transition-colors"
            >
              Wszystkie miasta
            </button>

            {/* Location options */}
            {results.map((loc) => (
              <button
                key={loc.id}
                onClick={() => {
                  onChange(loc);
                  setIsOpen(false);
                  setQuery('');
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white transition-colors flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>{loc.name}</span>
              </button>
            ))}

            {/* Loading state */}
            {isSearching && (
              <div className="px-3 py-4 text-center text-gray-500 dark:text-gray-400">
                Wyszukiwanie...
              </div>
            )}

            {/* Empty state */}
            {!isSearching && results.length === 0 && query && (
              <div className="px-3 py-4 text-center text-gray-500 dark:text-gray-400">
                Nie znaleziono miasta
              </div>
            )}

            {/* No results on empty search */}
            {!isSearching && results.length === 0 && !query && (
              <div className="px-3 py-4 text-center text-gray-500 dark:text-gray-400">
                Brak miast
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
