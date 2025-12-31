import React, { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DatePickerProps {
  label?: string;
  value: string; // Format: YYYY-MM-DD
  onChange: (value: string) => void;
  error?: string;
  min?: string;
  max?: string;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * DatePicker - Niestandardowy komponent wyboru daty (nie natywny input)
 * Używa popup z kalendarzem w stylu TimePicker
 * 
 * @example
 * ```tsx
 * <DatePicker
 *   label="Data rozpoczęcia"
 *   value={startDate}
 *   onChange={(value) => setStartDate(value)}
 * />
 * ```
 */
export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  ({ label, value, onChange, error, min, max, placeholder = 'Wybierz datę', disabled }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Parse value lub użyj dzisiejszej daty jako fallback
    const selectedDate = value ? new Date(value) : new Date();
    const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());
    const [viewYear, setViewYear] = useState(selectedDate.getFullYear());

    const monthNames = [
      'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
      'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
    ];

    const dayNames = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];

    // Generuj dni w miesiącu
    const daysInMonth = useMemo(() => {
      const firstDay = new Date(viewYear, viewMonth, 1);
      const lastDay = new Date(viewYear, viewMonth + 1, 0);
      const daysCount = lastDay.getDate();
      
      // Pierwszy dzień tygodnia (0 = Niedziela, 1 = Poniedziałek...)
      let firstDayOfWeek = firstDay.getDay();
      // Konwersja: Niedziela (0) -> 6, Poniedziałek (1) -> 0
      firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

      const days: (number | null)[] = [];
      
      // Puste dni przed 1szym
      for (let i = 0; i < firstDayOfWeek; i++) {
        days.push(null);
      }
      
      // Dni miesiąca
      for (let i = 1; i <= daysCount; i++) {
        days.push(i);
      }

      return days;
    }, [viewMonth, viewYear]);

    const formatDisplayDate = (dateStr: string) => {
      if (!dateStr) return placeholder;
      const date = new Date(dateStr);
      return date.toLocaleDateString('pl-PL', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    const handleDayClick = (day: number) => {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Sprawdź min/max
      if (min && dateStr < min) return;
      if (max && dateStr > max) return;
      
      onChange(dateStr);
      setIsOpen(false);
    };

    const isSelectedDay = (day: number) => {
      if (!value) return false;
      const selected = new Date(value);
      return selected.getDate() === day && 
             selected.getMonth() === viewMonth && 
             selected.getFullYear() === viewYear;
    };

    const isToday = (day: number) => {
      const today = new Date();
      return today.getDate() === day && 
             today.getMonth() === viewMonth && 
             today.getFullYear() === viewYear;
    };

    const isDisabledDay = (day: number) => {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (min && dateStr < min) return true;
      if (max && dateStr > max) return true;
      return false;
    };

    const previousMonth = () => {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear(viewYear - 1);
      } else {
        setViewMonth(viewMonth - 1);
      }
    };

    const nextMonth = () => {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear(viewYear + 1);
      } else {
        setViewMonth(viewMonth + 1);
      }
    };

    return (
      <div ref={ref} className="relative w-full">
        {label && (
          <label className="block text-xs font-normal text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        
        {/* Display Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'w-full px-2.5 py-1.5 text-left border rounded-lg transition-all group',
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
              : 'border-slate-200 hover:border-cyan-400 focus:border-cyan-500 focus:ring-cyan-100',
            disabled 
              ? 'bg-slate-50 cursor-not-allowed opacity-60' 
              : 'bg-white',
            'focus:ring-2'
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center">
                <Calendar className="w-3 h-3 text-white" />
              </div>
              <span className={cn(
                "text-sm font-medium",
                value ? "text-slate-900" : "text-slate-400"
              )}>
                {formatDisplayDate(value)}
              </span>
            </div>
            <ChevronRight className={cn(
              "w-3.5 h-3.5 text-slate-400 transition-transform",
              isOpen && 'rotate-90'
            )} />
          </div>
        </button>

        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}

        {/* Calendar Popup */}
        {isOpen && !disabled && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Calendar */}
            <div className="absolute z-50 mt-2 bg-white rounded-lg shadow-xl border border-slate-200 p-3 animate-in fade-in slide-in-from-top-2 duration-200 w-full min-w-[215px] sm:min-w-[280px] max-w-[320px]">
              {/* Header - Month/Year Navigation */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <button
                  type="button"
                  onClick={previousMonth}
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                
                <div className="text-sm font-semibold text-slate-900">
                  {monthNames[viewMonth]} {viewYear}
                </div>
                
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-[10px] font-medium text-slate-500 py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {daysInMonth.map((day, index) => (
                  <div key={index}>
                    {day === null ? (
                      <div className="aspect-square" />
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDayClick(day)}
                        disabled={isDisabledDay(day)}
                        className={cn(
                          'aspect-square w-full text-xs font-medium rounded-md transition-all',
                          isSelectedDay(day) && 'bg-gradient-to-br from-cyan-500 to-teal-500 text-white font-semibold shadow-sm',
                          !isSelectedDay(day) && isToday(day) && 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200',
                          !isSelectedDay(day) && !isToday(day) && !isDisabledDay(day) && 'text-slate-700 hover:bg-slate-100',
                          isDisabledDay(day) && 'text-slate-300 cursor-not-allowed line-through'
                        )}
                      >
                        {day}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Today Button */}
              <div className="mt-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    const todayStr = today.toISOString().split('T')[0];
                    onChange(todayStr);
                    setIsOpen(false);
                  }}
                  className="w-full py-1.5 text-xs font-medium text-cyan-600 hover:bg-cyan-50 rounded transition-colors"
                >
                  Dzisiaj
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';
