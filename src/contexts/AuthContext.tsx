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
 * Auth Provider
 * 
 * Zarządza stanem autentykacji użytkownika.
 * TODO: Integracja z Sanctum API (login/logout/me endpoints)
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Mock user - w produkcji to będzie z API
  const [user, setUser] = useState<User | null>(() => {
    // DEV ONLY - hardcoded provider user
    if (import.meta.env.DEV) {
      return {
        id: 1,
        name: 'Jan Kowalski',
        email: 'jan@example.com',
        role: 'provider',
      };
    }
    return null;
  });

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
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
