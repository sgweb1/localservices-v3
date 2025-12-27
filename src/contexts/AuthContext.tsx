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
      return MOCK_USERS[0]; // Marek Hydraulik (provider)
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
