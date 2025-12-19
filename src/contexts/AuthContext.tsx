import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'provider' | 'admin';
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
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
 * Mock Users - DEV Only
 * Testowi użytkownicy dla różnych ról
 */
export const MOCK_USERS: User[] = [
  // Providers
  { id: 1, name: 'Jan Kowalski', email: 'jan.kowalski@provider.pl', role: 'provider' },
  { id: 2, name: 'Anna Nowak', email: 'anna.nowak@provider.pl', role: 'provider' },
  { id: 3, name: 'Piotr Wiśniewski', email: 'piotr.wisniewski@provider.pl', role: 'provider' },
  { id: 4, name: 'Maria Lewandowska', email: 'maria.lewandowska@provider.pl', role: 'provider' },
  { id: 5, name: 'Tomasz Dąbrowski', email: 'tomasz.dabrowski@provider.pl', role: 'provider' },
  
  // Customers
  { id: 11, name: 'Krzysztof Zieliński', email: 'krzysztof.zielinski@customer.pl', role: 'customer' },
  { id: 12, name: 'Magdalena Szymańska', email: 'magdalena.szymanska@customer.pl', role: 'customer' },
  { id: 13, name: 'Andrzej Woźniak', email: 'andrzej.wozniak@customer.pl', role: 'customer' },
  { id: 14, name: 'Katarzyna Kamińska', email: 'katarzyna.kaminska@customer.pl', role: 'customer' },
  { id: 15, name: 'Michał Kozłowski', email: 'michal.kozlowski@customer.pl', role: 'customer' },
  
  // Admin
  { id: 100, name: 'Admin System', email: 'admin@localservices.pl', role: 'admin' },
];

/**
 * Auth Provider
 * 
 * Zarządza stanem autentykacji użytkownika.
 * TODO: Integracja z Sanctum API (login/logout/me endpoints)
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Mock user - w produkcji to będzie z API
  const [user, setUser] = useState<User | null>(() => {
    // DEV ONLY - check localStorage for saved user
    if (import.meta.env.DEV) {
      const savedUser = localStorage.getItem('dev_mock_user');
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch {
          // Fallback do domyślnego providera
        }
      }
      // Domyślny provider
      return MOCK_USERS[0]; // Jan Kowalski
    }
    return null;
  });

  const login = (userData: User) => {
    setUser(userData);
    if (import.meta.env.DEV) {
      localStorage.setItem('dev_mock_user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setUser(null);
    if (import.meta.env.DEV) {
      localStorage.removeItem('dev_mock_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
