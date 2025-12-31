/**
 * CalendarHeader - Nagłówek strony kalendarza
 * 
 * Wyświetla:
 * - Tytuł strony
 * - Ilość slotów i rezerwacji
 * - Akcje (zaznaczanie, dodawanie slotów, urlopy)
 * 
 * @param totalSlots - Całkowita ilość slotów
 * @param totalBookings - Całkowita ilość rezerwacji
 * @param selectionMode - Czy tryb zaznaczania aktywny
 * @param onToggleSelection - Toggle trybu zaznaczania
 * @param onAddSlot - Callback dodawania slotu
 * @param onManageBlocks - Callback zarządzania urlopami/blokami
 */

import React from 'react';
import { Plus, Ban, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarHeaderProps {
  totalSlots: number;
  totalBookings: number;
  selectionMode: boolean;
  onToggleSelection: () => void;
  onAddSlot: () => void;
  onManageBlocks: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  totalSlots,
  totalBookings,
  selectionMode,
  onToggleSelection,
  onAddSlot,
  onManageBlocks,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 md:p-0">
      {/* Tytuł i statystyki */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
          Kalendarz Dostępności
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {totalSlots} {totalSlots === 1 ? 'slot' : 'slotów'} • {totalBookings} {totalBookings === 1 ? 'rezerwacja' : 'rezerwacji'}
        </p>
      </div>

      {/* Desktop actions */}
      <div className="hidden md:flex items-center gap-2">
        {/* Przycisk zaznaczania */}
        <Button
          onClick={onToggleSelection}
          variant={selectionMode ? 'primary' : 'neutral'}
          size="sm"
          className={!selectionMode ? 'border' : ''}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          {selectionMode ? 'Anuluj zaznaczanie' : 'Zaznacz'}
        </Button>

        {/* Dodaj dostępność */}
        <Button
          onClick={onAddSlot}
          variant="primary"
          size="sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Dodaj dostępność</span>
        </Button>

        {/* Urlopy/Bloki */}
        <Button
          onClick={onManageBlocks}
          variant="danger"
          size="sm"
        >
          <Ban className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Urlopy/Bloki</span>
        </Button>
      </div>
    </div>
  );
};
