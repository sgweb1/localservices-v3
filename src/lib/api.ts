import axios, { AxiosInstance } from 'axios';

/**
 * Centralized API client dla wszystkich requestów
 * 
 * Automatycznie:
 * - Dodaje X-CSRF-TOKEN header z cookies (dla POST/PATCH/DELETE)
 * - Wysyła cookies (withCredentials: true)
 * - Konfiguruje baseURL z VITE_API_URL
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://ls.test',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ⭐ Wysyła cookies z requestem
});

/**
 * Helper: Odczytaj XSRF-TOKEN z cookies
 * Laravel Sanctum ustawia XSRF-TOKEN cookie automatycznie
 */
function getCSRFToken(): string | null {
  const name = 'XSRF-TOKEN=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookies = decodedCookie.split(';');
  
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length);
    }
  }
  return null;
}

/**
 * Interceptor: Auto-add CSRF token do każdego requesta
 * Działa dla GET/POST/PATCH/DELETE/PUT
 */
apiClient.interceptors.request.use((config) => {
  const token = getCSRFToken();
  if (token) {
    // Dekoduj token (Laravel encodeuje w cookie)
    config.headers['X-CSRF-TOKEN'] = decodeURIComponent(token);
  }
  return config;
});

// Error handler (opcjonalnie)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 419) {
      console.error('CSRF Token expired - zaloguj się ponownie');
      // Możesz tu dodać redirect do login page
    }
    return Promise.reject(error);
  }
);
