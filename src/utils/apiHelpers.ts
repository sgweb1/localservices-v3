/**
 * Utility helpers dla API z CSRF token handling
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://ls.test';

/**
 * Pobiera CSRF token z cookie XSRF-TOKEN (ustawionego przez Laravel)
 */
export const getCsrfToken = (): string => {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
};

/**
 * Wrapper dla fetch z automatycznym dodaniem CSRF tokenu
 */
export const apiFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const csrfToken = getCsrfToken();
  
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  // Merge istniejące headers jeśli istnieją
  if (options.headers instanceof Headers) {
    options.headers.forEach((value, key) => {
      headers[key] = value;
    });
  } else if (Array.isArray(options.headers)) {
    options.headers.forEach(([key, value]) => {
      headers[key] = value;
    });
  } else if (options.headers) {
    Object.assign(headers, options.headers);
  }

  // Dodaj CSRF token dla mutating methods (POST, PUT, PATCH, DELETE)
  if (options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method.toUpperCase())) {
    if (csrfToken) {
      headers['X-XSRF-TOKEN'] = csrfToken;
    }
  }

  // Jeśli body jest obiektem (nie FormData), dodaj Content-Type
  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });
};

/**
 * Helper do POST requestów
 */
export const apiPost = async (
  endpoint: string,
  data: any
): Promise<Response> => {
  return apiFetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Helper do DELETE requestów
 */
export const apiDelete = async (endpoint: string): Promise<Response> => {
  return apiFetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
  });
};

/**
 * Helper do PUT requestów
 */
export const apiPut = async (
  endpoint: string,
  data: any
): Promise<Response> => {
  return apiFetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * Helper do PATCH requestów
 */
export const apiPatch = async (
  endpoint: string,
  data: any
): Promise<Response> => {
  return apiFetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

/**
 * Helper do GET requestów
 */
export const apiGet = async (endpoint: string): Promise<Response> => {
  return apiFetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
  });
};
