/**
 * Utilities do zarządzania drafts w localStorage
 * 
 * CO: Funkcje do save/load/clear drafts z przechowaniem metadanych
 * JAK: Używają localStorage z JSON serialization + timestamp
 * CZEMU: Centralizacja logiki, łatwe testowanie, error handling
 */

export interface DraftMetadata {
  savedAt: number; // timestamp
  version: string; // app version dla future migrations
  size: number; // bytes
}

export interface Draft<T> {
  data: T;
  metadata: DraftMetadata;
}

/**
 * Zapisuje dane do localStorage z metadanymi
 * 
 * @param key - localStorage key (np. 'service-form-draft:123')
 * @param data - dane do zapisania
 * @returns true jeśli sukces, false jeśli fail (storage full, etc)
 * 
 * @example
 * const success = saveDraft('service-form-draft:1', { title: 'Test' });
 */
export function saveDraft<T>(key: string, data: T): boolean {
  try {
    const draft: Draft<T> = {
      data,
      metadata: {
        savedAt: Date.now(),
        version: '1.0.0',
        size: JSON.stringify(data).length,
      },
    };

    localStorage.setItem(key, JSON.stringify(draft));
    return true;
  } catch (error) {
    // localStorage full lub other error
    console.error(`[Draft] Failed to save draft "${key}":`, error);
    return false;
  }
}

/**
 * Ładuje draft z localStorage
 * 
 * @param key - localStorage key
 * @returns dane z draftu lub null jeśli nie istnieje/invalid
 * 
 * @example
 * const formData = loadDraft('service-form-draft:1');
 * if (formData) {
 *   // prefill form
 * }
 */
export function loadDraft<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const draft: Draft<T> = JSON.parse(item);
    return draft.data;
  } catch (error) {
    console.error(`[Draft] Failed to load draft "${key}":`, error);
    return null;
  }
}

/**
 * Usuwa draft z localStorage
 * 
 * @param key - localStorage key
 * 
 * @example
 * clearDraft('service-form-draft:1');
 */
export function clearDraft(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`[Draft] Failed to clear draft "${key}":`, error);
  }
}

/**
 * Pobiera metadane draftu bez ładowania całych danych
 * 
 * CZEMU: Potrzebne do wyświetlenia "Zapisano o 14:32" bez ładowania formularza
 * 
 * @param key - localStorage key
 * @returns metadane lub null
 * 
 * @example
 * const meta = getDraftMetadata('service-form-draft:1');
 * if (meta) {
 *   console.log(`Draft z ${new Date(meta.savedAt).toLocaleTimeString()}`);
 * }
 */
export function getDraftMetadata(key: string): DraftMetadata | null {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const draft: Draft<unknown> = JSON.parse(item);
    return draft.metadata;
  } catch (error) {
    console.error(`[Draft] Failed to get draft metadata "${key}":`, error);
    return null;
  }
}

/**
 * Sprawdza czy draft istnieje i czy jest "świeży" (younger than maxAge)
 * 
 * CZгоду: Do logiki "czy pokazać modal z pytaniem o wczytanie?"
 * 
 * @param key - localStorage key
 * @param maxAgeMs - max age w milisekundach (domyślnie 7 dni)
 * @returns true jeśli draft istnieje i jest świeży
 * 
 * @example
 * if (hasFreshDraft('service-form-draft:1', 24 * 60 * 60 * 1000)) {
 *   // pokaz modal
 * }
 */
export function hasFreshDraft(key: string, maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): boolean {
  const metadata = getDraftMetadata(key);
  if (!metadata) return false;

  const age = Date.now() - metadata.savedAt;
  return age < maxAgeMs;
}

/**
 * Formatuje timestamp na czytelny string (dla UI)
 * 
 * @param timestamp - timestamp w ms
 * @returns "14:32" lub "wczoraj 14:32" lub "2 dni temu"
 * 
 * @example
 * const meta = getDraftMetadata(key);
 * console.log(`Zapisano ${formatDraftTime(meta!.savedAt)}`);
 */
export function formatDraftTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Jeśli mniej niż minuta - "teraz"
  if (diffSec < 60) return 'teraz';

  // Jeśli mniej niż godzina - "5 min temu"
  if (diffHours < 1) return `${diffMin} min temu`;

  // Jeśli dzisiaj - "14:32"
  const date = new Date(timestamp);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  }

  // Jeśli wczoraj - "wczoraj 14:32"
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `wczoraj ${date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`;
  }

  // Jeśli mniej niż tydzień - "2 dni temu"
  if (diffDays < 7) return `${diffDays} dni temu`;

  // Pełna data
  return date.toLocaleDateString('pl-PL');
}
