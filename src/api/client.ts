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

  constructor() {
    this.client = axios.create({
      baseURL: '/api/v1',
      withCredentials: true, // Sanctum SPA cookie-based auth
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor - dodaj token
    this.client.interceptors.request.use(
      (config) => {
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
