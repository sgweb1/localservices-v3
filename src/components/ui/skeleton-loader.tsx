import * as React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="grid grid-cols-7 gap-px bg-slate-200">
        {Array.from({ length: 7 }).map((_, dayIndex) => (
          <div key={dayIndex} className="bg-white">
            {/* Header skeleton */}
            <div className="p-4 bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
              <div className="h-4 w-12 bg-slate-300 rounded animate-pulse mb-2" />
              <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
            </div>

            {/* Slots skeleton */}
            <div className="p-3 space-y-2">
              {Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, slotIndex) => (
                <div
                  key={slotIndex}
                  className="p-3 rounded-xl bg-slate-100 animate-pulse"
                  style={{ animationDelay: `${(dayIndex * 3 + slotIndex) * 50}ms` }}
                >
                  <div className="h-4 w-24 bg-slate-300 rounded mb-2" />
                  <div className="h-2 w-full bg-slate-200 rounded mb-2" />
                  <div className="h-3 w-16 bg-slate-300 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
