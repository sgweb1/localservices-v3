/**
 * Hook do automatycznego zapisywania danych do localStorage (generic)
 * 
 * CO: Śledzi zmiany w danych i automatycznie je zapisuje co 30 sekund
 * JAK: setInterval + useState + useEffect + localStorage
 * CZEMU: Prevencja utraty danych przy browser crash / tab close
 * 
 * ZMIANA (2025-01-02): Dodano throttling (co 30s zamiast każdej zmiany)
 * aby zredukować writes do localStorage (performance optimization)
 */

import { useEffect, useRef, useState } from 'react';
import { saveDraft, getDraftMetadata } from '@/utils/draftStorage';

export interface UseDraftSaveOptions {
  /** Interwał save w ms (domyślnie 30000 = 30 sekund) */
  intervalMs?: number;
  /** Czy save na unmount (domyślnie true) */
  saveOnUnmount?: boolean;
  /** Czy save immediately na inicjalizacji (domyślnie false) */
  saveImmediate?: boolean;
  /** Callback po successful save */
  onSave?: (timestamp: number) => void;
  /** Callback na error */
  onError?: (error: Error) => void;
}

interface UseDraftSaveReturn {
  /** Czy aktualnie się zapisuje */
  isSaving: boolean;
  /** Timestamp ostatniego successful save (lub null) */
  lastSaved: number | null;
  /** Czy ostatni save się nie powiódł */
  hasError: boolean;
  /** Ręcznie trigger save (zamiast czekać na interval) */
  saveDraftNow: () => Promise<boolean>;
}

/**
 * Hook do auto-save danych do localStorage
 * 
 * @param key - localStorage key (unique identifier)
 * @param data - dane do zapisania
 * @param options - konfiguracja (interval, callbacks, etc)
 * @returns { isSaving, lastSaved, hasError, saveDraftNow }
 * 
 * @example
 * // W component
 * const { isSaving, lastSaved } = useDraftSave(
 *   'service-form-draft:1',
 *   { title: 'Test', pricing: 'hourly' },
 *   { intervalMs: 30000, onSave: () => toast('Zapisano') }
 * );
 * 
 * // W JSX
 * {isSaving && <p>Zapisuję...</p>}
 * {lastSaved && <p>✓ Zapisano {formatTime(lastSaved)}</p>}
 */
export function useDraftSave<T>(
  key: string,
  data: T,
  options: UseDraftSaveOptions = {}
): UseDraftSaveReturn {
  const {
    intervalMs = 30000, // 30 sekund
    saveOnUnmount = true,
    saveImmediate = false,
    onSave,
    onError,
  } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);

  // Ref do trackowania czy data się zmieniła (throttling)
  const dataRef = useRef<T>(data);
  const hasChangedRef = useRef(false);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  // Track changes w danych
  useEffect(() => {
    if (JSON.stringify(dataRef.current) !== JSON.stringify(data)) {
      dataRef.current = data;
      hasChangedRef.current = true;
    }
  }, [data]);

  // Ręczny save (bez throttling)
  const saveDraftNow = async (): Promise<boolean> => {
    setIsSaving(true);
    setHasError(false);

    try {
      const success = saveDraft(key, dataRef.current);

      if (success) {
        const timestamp = Date.now();
        setLastSaved(timestamp);
        setHasError(false);
        onSave?.(timestamp);
        hasChangedRef.current = false; // Reset flag
        return true;
      } else {
        throw new Error('Failed to save draft (localStorage full?)');
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[useDraftSave] Save failed:', err);
      setHasError(true);
      onError?.(err);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Setup interval do periodic save
  useEffect(() => {
    // Immediate save jeśli requested
    if (saveImmediate) {
      saveDraftNow();
    }

    // Setup interval
    intervalIdRef.current = setInterval(() => {
      // Tylko save jeśli data się zmieniła (throttling)
      if (hasChangedRef.current) {
        saveDraftNow();
      }
    }, intervalMs);

    // Cleanup
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }

      // Save on unmount jeśli requested
      if (saveOnUnmount && hasChangedRef.current) {
        saveDraft(key, dataRef.current);
      }
    };
  }, [key, intervalMs, saveOnUnmount, saveImmediate]);

  return {
    isSaving,
    lastSaved,
    hasError,
    saveDraftNow,
  };
}

/**
 * EXPORT: Utility do ładowania metadanych draft (bez ładowania pełnych danych)
 * 
 * Użycie: const meta = getDraftMetadata('key'); 
 *        if (meta) { showModal('Wczytać draft z ' + formatTime(meta.savedAt)) }
 */
export { getDraftMetadata, formatDraftTime } from '@/utils/draftStorage';
