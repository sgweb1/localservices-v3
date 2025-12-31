/**
 * WeekNavigation - Nawigacja między tygodniami kalendarza
 * 
 * Pozwala przełączać się między poprzednim/następnym tygodniem
 * oraz wyświetla aktualny offset (np. "Bieżący tydzień", "+2 tyg.")
 * 
 * @param currentWeekOffset - Obecny offset tygodnia (0 = bieżący)
 * @param onPrevious - Callback przejścia do poprzedniego tygodnia
 * @param onNext - Callback przejścia do następnego tygodnia
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WeekNavigationProps {
  currentWeekOffset: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const WeekNavigation: React.FC<WeekNavigationProps> = ({
  currentWeekOffset,
  onPrevious,
  onNext,
}) => {
  const getWeekLabel = () => {
    if (currentWeekOffset === 0) return 'Bieżący tydzień';
    if (currentWeekOffset === 1) return 'Następny tydzień';
    if (currentWeekOffset === -1) return 'Poprzedni tydzień';
    return `${currentWeekOffset > 0 ? '+' : ''}${currentWeekOffset} tyg.`;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
      <Button
        onClick={onPrevious}
        variant="neutral"
        size="sm"
        className="border"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Poprzedni
      </Button>

      <span className="text-sm font-medium text-slate-700">
        {getWeekLabel()}
      </span>

      <Button
        onClick={onNext}
        variant="neutral"
        size="sm"
        className="border"
      >
        Następny
        <ChevronRight className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
};
