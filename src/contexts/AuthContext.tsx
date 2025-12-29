import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'provider' | 'admin';
  password?: string; // DEV only - dla testowego logowania
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Generuje mock Sanctum token dla dev środowiska
 * DEV ONLY - w produkcji token pochodzi z API /login endpoint
 */
function generateMockToken(userId: number): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `dev_mock_${userId}_${timestamp}_${random}`;
}

/**
 * Mock Users - DEV Only
 * Testowi użytkownicy dla różnych ról
 * Hasło dla wszystkich: 'password'
 */
export const MOCK_USERS: User[] = [
  // Providers (z bazy danych UserSeeder)
  { id: 6, name: 'Marek Hydraulik', email: 'hydraulik1@example.com', role: 'provider', password: 'password' },
  { id: 7, name: 'Andrzej Nowak - Elektryk', email: 'elektryk1@example.com', role: 'provider', password: 'password' },
  { id: 8, name: 'Sprzątanie Express', email: 'sprzatanie1@example.com', role: 'provider', password: 'password' },
  { id: 9, name: 'Anna Korepetycje', email: 'korepetycje1@example.com', role: 'provider', password: 'password' },
  { id: 10, name: 'Opieka Senior Care', email: 'opieka1@example.com', role: 'provider', password: 'password' },
  
  // Customers (z bazy danych UserSeeder)
  { id: 1, name: 'Jan Kowalski', email: 'customer1@example.com', role: 'customer', password: 'password' },
  { id: 2, name: 'Anna Nowak', email: 'customer2@example.com', role: 'customer', password: 'password' },
  { id: 3, name: 'Piotr Wiśniewski', email: 'customer3@example.com', role: 'customer', password: 'password' },
  { id: 4, name: 'Maria Wójcik', email: 'customer4@example.com', role: 'customer', password: 'password' },
  { id: 5, name: 'Krzysztof Kamiński', email: 'customer5@example.com', role: 'customer', password: 'password' },
  
  // Admin
  { id: 100, name: 'Admin System', email: 'admin@localservices.test', role: 'admin', password: 'password' },
];

/**
 * Auth Provider
 * 
 * Zarządza stanem autentykacji użytkownika.
 * W DEV wysyła mock tokeny - w produkcji integracja z Sanctum API
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Mock user - w produkcji to będzie z API
  const [user, setUser] = useState<User | null>(() => {
    // DEV ONLY - check localStorage for saved user
    if (import.meta.env.DEV) {
      try {
        // Test localStorage availability
        const testKey = '__ls_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        console.log('[AuthContext] localStorage jest dostępny');
      } catch (e) {
        console.error('[AuthContext] ⚠️ localStorage NIE jest dostępny! Prawdopodobnie problem z certyfikatem HTTPS.', e);
        alert('⚠️ localStorage jest zablokowany przez przeglądarkę.\n\nProszę dodać wyjątek dla certyfikatu https://ls.test\nlub użyć HTTP zamiast HTTPS (zmień APP_URL w .env na http://ls.test)');
      }
      
      const savedUser = localStorage.getItem('dev_mock_user');
      console.log('[AuthContext] Inicjalizacja - dev_mock_user z localStorage:', savedUser ? 'znaleziono' : 'brak');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          console.log('[AuthContext] Przywrócono użytkownika:', parsed.name, parsed.role);
          return parsed;
        } catch (e) {
          console.error('[AuthContext] Błąd parsowania dev_mock_user:', e);
          // Invalid JSON - stay logged out
        }
      }
    }
    console.log('[AuthContext] Inicjalizacja bez zalogowanego użytkownika');
    // Domyślnie NIEZALOGOWANY - wymaga ręcznego logowania przez /dev/login
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    if (import.meta.env.DEV) {
      return localStorage.getItem('dev_mock_token') || null;
    }
    return localStorage.getItem('sanctum_token') || null;
  });

  const login = (userData: User) => {
    console.log('[AuthContext] Login:', userData.name, userData.role);
    setUser(userData);
    const newToken = import.meta.env.DEV 
      ? generateMockToken(userData.id)
      : `sanctum_token_${userData.id}`;
    setToken(newToken);
    if (import.meta.env.DEV) {
      localStorage.setItem('dev_mock_user', JSON.stringify(userData));
      localStorage.setItem('dev_mock_token', newToken);
      console.log('[AuthContext] Zapisano do localStorage:', {
        user: userData.name,
        token: newToken.substring(0, 30) + '...'
      });
    } else {
      localStorage.setItem('sanctum_token', newToken);
    }
  };

  const logout = () => {
    console.log('[AuthContext] Logout - czyszczenie danych');
    setUser(null);
    setToken(null);
    if (import.meta.env.DEV) {
      localStorage.removeItem('dev_mock_user');
      localStorage.removeItem('dev_mock_token');
    } else {
      localStorage.removeItem('sanctum_token');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
