/**
 * Komponent: Indicator status draft save
 * 
 * CO: Wyświetla "Zapisuję...", "✓ Zapisano 14:32", lub nic
 * JAK: Prostej UI z spinner + text
 * CZEMU: Feedback dla usera że dane się zapisują
 * 
 * ZMIANA (2025-01-02): Dodano animation fade-out po 5s
 */

import { useEffect, useState } from 'react';
import { formatDraftTime } from '@/utils/draftStorage';

interface DraftSaveIndicatorProps {
  /** Czy aktualnie zapisuje */
  isSaving: boolean;
  /** Timestamp ostatniego save */
  lastSaved: number | null;
  /** Czy błąd */
  hasError?: boolean;
}

/**
 * Wyświetla status draft save
 * 
 * @example
 * <DraftSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
 * 
 * Renderuje:
 * - isSaving=true: "⏳ Zapisuję..."
 * - lastSaved=14:32: "✓ Zapisano 14:32" (znika po 5s)
 * - hasError=true: "⚠️ Błąd zapisu"
 */
export function DraftSaveIndicator({
  isSaving,
  lastSaved,
  hasError = false,
}: DraftSaveIndicatorProps) {
  const [showSaveMessage, setShowSaveMessage] = useState(false);

  // Show "Zapisano" message dla 5 sekund po save
  useEffect(() => {
    if (lastSaved && !isSaving) {
      setShowSaveMessage(true);
      const timeout = setTimeout(() => setShowSaveMessage(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [lastSaved, isSaving]);

  // Nic nie pokazuj jeśli nic się nie dzieje
  if (!isSaving && !showSaveMessage && !hasError) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 text-xs">
      {isSaving && (
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-3 py-2 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Zapisuję...</span>
        </div>
      )}

      {showSaveMessage && !isSaving && (
        <div className="animate-fade-out flex items-center gap-2 text-green-600 dark:text-green-400 bg-white dark:bg-slate-900 px-3 py-2 rounded-lg shadow-md border border-green-200 dark:border-green-800">
          <span>✓</span>
          <span>Zapisano {formatDraftTime(lastSaved!)}</span>
        </div>
      )}

      {hasError && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-white dark:bg-slate-900 px-3 py-2 rounded-lg shadow-md border border-red-200 dark:border-red-800">
          <span>⚠️</span>
          <span>Błąd zapisu</span>
        </div>
      )}
    </div>
  );
}
