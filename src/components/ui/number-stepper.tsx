import * as React from 'react';
import { Minus, Plus } from 'lucide-react';

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  suffix?: string;
  helperText?: string;
}

export const NumberStepper: React.FC<NumberStepperProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  suffix,
  helperText,
}) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(Math.max(min, value - step));
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(Math.min(max, value + step));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || min;
    onChange(Math.max(min, Math.min(max, newValue)));
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className="w-12 h-12 rounded-xl border-2 border-slate-200 bg-white hover:border-cyan-400 hover:bg-cyan-50 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:bg-white flex items-center justify-center group"
        >
          <Minus className="w-5 h-5 text-slate-600 group-hover:text-cyan-600 transition-colors" />
        </button>

        <div className="flex-1 relative">
          <input
            type="number"
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            className="w-full px-4 py-3 text-center text-2xl font-bold text-slate-900 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all tabular-nums"
          />
          {suffix && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
              {suffix}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className="w-12 h-12 rounded-xl border-2 border-slate-200 bg-white hover:border-cyan-400 hover:bg-cyan-50 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:bg-white flex items-center justify-center group"
        >
          <Plus className="w-5 h-5 text-slate-600 group-hover:text-cyan-600 transition-colors" />
        </button>
      </div>

      {helperText && (
        <p className="text-xs text-slate-500 mt-2">{helperText}</p>
      )}

      {/* Progress bar */}
      <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-teal-500 transition-all duration-300 ease-out"
          style={{ width: `${((value - min) / (max - min)) * 100}%` }}
        />
      </div>
    </div>
  );
};
