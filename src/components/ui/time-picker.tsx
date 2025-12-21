import * as React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  min?: string;
  max?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({ 
  value, 
  onChange, 
  label,
  min = '00:00',
  max = '23:59'
}) => {
  const [hours, minutes] = value.split(':').map(Number);
  const [isOpen, setIsOpen] = React.useState(false);
  const [tempHours, setTempHours] = React.useState(hours);
  const [tempMinutes, setTempMinutes] = React.useState(minutes);

  const hoursArray = Array.from({ length: 24 }, (_, i) => i);
  const minutesArray = [0, 15, 30, 45];

  const formatTime = (h: number, m: number) => {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const handleApply = () => {
    onChange(formatTime(tempHours, tempMinutes));
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-xs font-normal text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      
      {/* Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left border border-slate-200 rounded-lg bg-white hover:border-cyan-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-medium text-slate-900 tabular-nums">
              {formatTime(tempHours, tempMinutes)}
            </span>
          </div>
          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-xl border border-slate-200 p-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex gap-2">
              {/* Hours */}
              <div className="flex-1">
                <p className="text-[10px] font-medium text-slate-500 mb-1.5 text-center">GODZINA</p>
                <div className="space-y-0.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                  {hoursArray.map(h => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setTempHours(h)}
                      className={`w-full px-2 py-1.5 text-center rounded-md text-sm font-medium transition-all ${
                        tempHours === h
                          ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {h.toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minutes */}
              <div className="flex-1">
                <p className="text-[10px] font-medium text-slate-500 mb-1.5 text-center">MINUTA</p>
                <div className="space-y-0.5">
                  {minutesArray.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTempMinutes(m)}
                      className={`w-full px-3 py-2 text-center rounded-lg font-semibold transition-all ${
                        tempMinutes === m
                          ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg scale-105'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {m.toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleApply}
              className="w-full mt-3 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-sm font-medium rounded-lg hover:shadow-md transition-all"
            >
              Zatwierdź
            </button>
          </div>
        </>
      )}
    </div>
  );
};
