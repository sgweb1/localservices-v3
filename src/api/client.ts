import axios, { AxiosInstance, AxiosError } from 'axios';

/**
 * Axios client skonfigurowany dla API v1
 * 
 * - baseURL: /api/v1
 * - Authorization: Bearer token z localStorage
 * - Error handling: 401 redirect to login
 */
class ApiClient {
  private client: AxiosInstance;
  private csrfInitialized = false;

  constructor() {
    this.client = axios.create({
      baseURL: '/api/v1',
      withCredentials: true, // Sanctum SPA cookie-based auth
      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Bootstrap CSRF cookie on client creation (dla pierwszego requestu na https://ls.test)
    axios.get('/sanctum/csrf-cookie', { withCredentials: true }).catch(() => {
      // cichy fallback - następne mutacje spróbują ponownie
    });

    // Request interceptor - dodaj token
    this.client.interceptors.request.use(
      async (config) => {
        // Sanctum: pobierz CSRF cookie przed mutacjami
        if (!this.csrfInitialized && config.method && !['get', 'head', 'options'].includes(config.method.toLowerCase())) {
          await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
          this.csrfInitialized = true;
        }

        // Token opcjonalny (np. auth_token) – preferuj ciasteczko Sanctum
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle 401
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          const isAuthDemo = window.location.pathname.startsWith('/auth-demo');
          const isDevLogin = window.location.pathname.startsWith('/dev/login');
          // Uniknij pętli odświeżania na stronie logowania/demo
          if (!isAuthDemo && !isDevLogin) {
            localStorage.removeItem('auth_token');
            window.location.href = '/dev/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  public getInstance(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient().getInstance();
