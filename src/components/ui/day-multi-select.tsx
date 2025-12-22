import * as React from 'react';

interface DayMultiSelectProps {
  selected: number[];
  onChange: (days: number[]) => void;
  label?: string;
}

const DAYS = [
  { value: 1, label: 'Poniedziałek', short: 'Pon', color: 'from-cyan-400 to-cyan-600' },
  { value: 2, label: 'Wtorek', short: 'Wt', color: 'from-blue-400 to-blue-600' },
  { value: 3, label: 'Środa', short: 'Śr', color: 'from-indigo-400 to-indigo-600' },
  { value: 4, label: 'Czwartek', short: 'Czw', color: 'from-purple-400 to-purple-600' },
  { value: 5, label: 'Piątek', short: 'Pt', color: 'from-pink-400 to-pink-600' },
  { value: 6, label: 'Sobota', short: 'Sob', color: 'from-orange-400 to-orange-600' },
  { value: 7, label: 'Niedziela', short: 'Nie', color: 'from-red-400 to-red-600' },
];

export const DayMultiSelect: React.FC<DayMultiSelectProps> = ({
  selected,
  onChange,
  label,
}) => {
  const toggleDay = (day: number) => {
    if (selected.includes(day)) {
      onChange(selected.filter(d => d !== day));
    } else {
      onChange([...selected, day].sort());
    }
  };

  const selectAll = () => {
    onChange(DAYS.map(d => d.value));
  };

  const selectWorkDays = () => {
    onChange([1, 2, 3, 4, 5]);
  };

  const selectWeekend = () => {
    onChange([6, 7]);
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="w-full space-y-4">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={selectAll}
          className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          Wszystkie
        </button>
        <button
          type="button"
          onClick={selectWorkDays}
          className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          Pn-Pt
        </button>
        <button
          type="button"
          onClick={selectWeekend}
          className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          Weekend
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          Wyczyść
        </button>
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {DAYS.map(day => {
          const isSelected = selected.includes(day.value);
          return (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={`
                relative px-3 py-1.5 rounded-lg text-xs font-medium
                transition-colors
                ${isSelected
                  ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }
              `}
            >
              {day.short}
            </button>
          );
        })}
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
        <span className="text-xs text-slate-600">
          Wybrano:
        </span>
        <span className="text-xs font-medium text-slate-900">
          {selected.length === 0 
            ? 'brak'
            : selected.length === 7
              ? 'wszystkie dni'
              : `${selected.length} ${selected.length === 1 ? 'dzień' : 'dni'}`
          }
        </span>
      </div>
    </div>
  );
};
