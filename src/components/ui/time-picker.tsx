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
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
        </label>
      )}
      
      {/* Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-left border-2 border-slate-200 rounded-xl bg-white hover:border-cyan-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all duration-200 group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {formatTime(tempHours, tempMinutes)}
            </span>
          </div>
          <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-2xl border-2 border-slate-200 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex gap-3">
              {/* Hours */}
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500 mb-2 text-center">GODZINA</p>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                  {hoursArray.map(h => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setTempHours(h)}
                      className={`w-full px-3 py-2 text-center rounded-lg font-semibold transition-all ${
                        tempHours === h
                          ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg scale-105'
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
                <p className="text-xs font-semibold text-slate-500 mb-2 text-center">MINUTA</p>
                <div className="space-y-1">
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
              className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Zatwierdź
            </button>
          </div>
        </>
      )}
    </div>
  );
};
