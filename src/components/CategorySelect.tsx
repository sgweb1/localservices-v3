import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import type { ServiceCategory } from '../types/service';
import { resolveIcon } from '../lib/iconMap';

interface CategorySelectProps {
  /** Lista dostępnych kategorii z bazy */
  categories: ServiceCategory[];
  /** Wybrana kategoria */
  selected: ServiceCategory | null;
  /** Callback gdy się zmieni wybór */
  onChange: (category: ServiceCategory | null) => void;
  /** Placeholder tekst */
  placeholder?: string;
  /** Czy loading */
  loading?: boolean;
  /** Id kontrolki (dla powiązania etykiety) */
  id?: string;
  /** Id etykiety powiązanej z kontrolką */
  ariaLabelledBy?: string;
  /** Alternatywny aria-label gdy brak labelki */
  ariaLabel?: string;
}

/**
 * CategorySelect - Reusable komponent do wyboru kategorii usług
 * Wyświetla ikony bezpośrednio z bazy danych
 * Używany w: AdvancedSearchBar, ServiceFilter, etc.
 */
export const CategorySelect: React.FC<CategorySelectProps> = ({
  categories,
  selected,
  onChange,
  placeholder = 'Wybierz kategorię',
  loading = false,
  id,
  ariaLabelledBy,
  ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(query.toLowerCase())
  );

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
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        id={id}
        aria-labelledby={ariaLabelledBy}
        aria-label={ariaLabel ?? placeholder}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full h-11 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm px-3 py-2 flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
      >
        <span className="flex items-center gap-2">
          {selected ? (
            <>
              {selected.icon && (
                <span className="flex-shrink-0">
                  {React.createElement(resolveIcon(selected.icon), {
                    className: 'w-4 h-4 text-sky-600 dark:text-sky-400',
                  })}
                </span>
              )}
              <span>{selected.name}</span>
            </>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
          )}
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
            placeholder="Szukaj..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-t-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
              Wszystkie kategorie
            </button>

            {/* Category options */}
            {filteredCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onChange(cat);
                  setIsOpen(false);
                  setQuery('');
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white transition-colors flex items-center gap-2"
              >
                {cat.icon && (
                  <span className="flex-shrink-0">
                    {React.createElement(resolveIcon(cat.icon), {
                      className: 'w-4 h-4 text-sky-600 dark:text-sky-400',
                    })}
                  </span>
                )}
                <span>{cat.name}</span>
              </button>
            ))}

            {/* Empty state */}
            {filteredCategories.length === 0 && (
              <div className="px-3 py-4 text-center text-gray-500 dark:text-gray-400">
                Nie znaleziono kategorii
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
