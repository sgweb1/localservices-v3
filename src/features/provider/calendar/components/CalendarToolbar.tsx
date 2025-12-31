/**
 * CalendarToolbar - Pasek narzędzi kalendarza
 * 
 * Zawiera:
 * - Przełącznik widoku (grid/list)
 * - Filtr slotów (wszystkie/aktywne/pełne)
 * - Toggle rezerwacji
 * - Przycisk szablonów
 * 
 * @param viewMode - Aktywny tryb widoku
 * @param setViewMode - Funkcja zmiany trybu widoku
 * @param filterMode - Aktywny filtr
 * @param setFilterMode - Funkcja zmiany filtru
 * @param showBookings - Czy pokazywać rezerwacje
 * @param setShowBookings - Funkcja toggle rezerwacji
 * @param selectionMode - Czy tryb zaznaczania aktywny
 * @param onCopyTemplate - Callback kopiowania szablonu
 */

import React from 'react';
import { LayoutGrid, List, Calendar, Sparkles } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CalendarToolbarProps {
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  filterMode: 'all' | 'active' | 'full';
  setFilterMode: (mode: 'all' | 'active' | 'full') => void;
  showBookings: boolean;
  setShowBookings: (show: boolean) => void;
  selectionMode: boolean;
  onCopyTemplate: () => void;
}

export const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  viewMode,
  setViewMode,
  filterMode,
  setFilterMode,
  showBookings,
  setShowBookings,
  selectionMode,
  onCopyTemplate,
}) => {
  const handleTemplateClick = () => {
    if (!selectionMode) {
      toast.info('Włącz tryb zaznaczania, aby użyć szablonów');
      return;
    }
    onCopyTemplate();
  };

  return (
    <div className="flex items-center justify-between gap-2 px-4 md:px-0">
      <div className="flex items-center gap-2">
        {/* View toggle - Grid/List */}
        <div className="inline-flex bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
            aria-label="Widok siatki"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
            aria-label="Widok listy"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Filter dropdown */}
        <Select
          value={filterMode}
          onChange={(e) => setFilterMode(e.target.value as 'all' | 'active' | 'full')}
          className="px-3 py-2 text-xs border-2 border-slate-200 rounded-lg bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all"
        >
          <option value="all">Wszystkie sloty</option>
          <option value="active">Tylko aktywne</option>
          <option value="full">Tylko pełne</option>
        </Select>

        {/* Show bookings toggle */}
        <Button
          onClick={() => setShowBookings(!showBookings)}
          variant={showBookings ? 'primary' : 'neutral'}
          size="sm"
          className={!showBookings ? 'border-2' : ''}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Rezerwacje</span>
        </Button>

        {/* Template button */}
        <Button
          onClick={handleTemplateClick}
          disabled={!selectionMode}
          variant="neutral"
          size="sm"
          className="border-2"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Szablon</span>
        </Button>
      </div>
    </div>
  );
};
