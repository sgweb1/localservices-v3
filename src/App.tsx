import { useEffect } from 'react';
import { apiClient } from '@/lib/api';

export function App() {
  useEffect(() => {
    // ⭐ KLUCZOWE: Pobierz CSRF token na starcie aplikacji
    // Laravel Sanctum automatycznie ustawia XSRF-TOKEN w cookies
    // Ten endpoint MUSI być dostępny bez auth
    apiClient.get('/sanctum/csrf-cookie').catch((error) => {
      console.warn('Nie udało się pobrać CSRF tokena:', error.message);
    });
  }, []);
  
  return (
    // ...existing code...
  );
}