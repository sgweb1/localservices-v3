const MOCK_MODE_KEY = 'ls2_mock_mode';

/**
 * Ustawia tryb mock globalnie (localStorage)
 */
export function setMockMode(enabled: boolean): void {
  try {
    localStorage.setItem(MOCK_MODE_KEY, enabled ? '1' : '0');
    // Odśwież stronę aby zastosować zmiany
    window.location.reload();
  } catch (e) {
    console.warn('Nie można zapisać trybu mock:', e);
  }
}

/**
 * Pobiera aktualny tryb mock
 */
export function getMockMode(): boolean {
  try {
    return localStorage.getItem(MOCK_MODE_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Sprawdza czy aplikacja jest w trybie mock
 * 
 * Sprawdza:
 * 1. URL param ?mock=1
 * 2. localStorage ls2_mock_mode=1
 */
export function isMockMode(): boolean {
  try {
    // URL param ma priorytet
    const params = new URLSearchParams(window.location.search);
    if (params.get('mock') === '1') return true;
    
    // localStorage jako fallback
    return getMockMode();
  } catch {}
  return false;
}
