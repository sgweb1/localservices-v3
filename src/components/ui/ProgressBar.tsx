import React from 'react';

/**
 * Progress Bar - pasek progresu dla limitów planu
 * 
 * Identyczny z LocalServices: pokazuje current/limit, kolory per stan
 */
interface ProgressBarProps {
  current: number;
  limit: number;
  isUnlimited?: boolean;
  isExceeded?: boolean;
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  limit,
  isUnlimited = false,
  isExceeded = false,
  showLabel = true,
  className = '',
}) => {
  const percentage = isUnlimited ? 0 : Math.min(100, (current / limit) * 100);
  
  // Kolory jak w LocalServices
  let barColor = 'bg-primary-500'; // normalny stan
  if (isExceeded) {
    barColor = 'bg-error'; // przekroczony limit
  } else if (percentage >= 90) {
    barColor = 'bg-warning'; // blisko limitu
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{current} / {isUnlimited ? '∞' : limit}</span>
          {!isUnlimited && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
