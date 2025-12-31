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
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

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
    <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4 p-4 md:p-0">
      {/* Tytuł i statystyki */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
          Kalendarz Dostępności
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {totalSlots} {totalSlots === 1 ? 'slot' : 'slotów'} • {totalBookings} {totalBookings === 1 ? 'rezerwacja' : 'rezerwacji'}
        </p>
      </div>

      {/* Actions - mobile responsive */}
      <TooltipProvider>
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Przycisk zaznaczania */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onToggleSelection}
                variant={selectionMode ? 'primary' : 'neutral'}
                size="sm"
                className={!selectionMode ? 'border' : ''}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{selectionMode ? 'Anuluj' : 'Zaznacz'}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="md:hidden">
              <p>{selectionMode ? 'Anuluj zaznaczanie' : 'Zaznacz sloty'}</p>
            </TooltipContent>
          </Tooltip>

          {/* Dodaj dostępność */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onAddSlot}
                variant="primary"
                size="sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Dodaj</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="md:hidden">
              <p>Dodaj dostępność</p>
            </TooltipContent>
          </Tooltip>

          {/* Urlopy/Bloki */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onManageBlocks}
                variant="danger"
                size="sm"
              >
                <Ban className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Urlopy</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="md:hidden">
              <p>Urlopy i bloki</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
};
