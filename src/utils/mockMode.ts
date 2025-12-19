export function isMockMode(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mock') === '1') return true;
  } catch {}
  // Opcjonalnie można dodać przełącznik w localStorage później
  return false;
}
