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
        // Test localStorage availability
        const testKey = '__ls_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
 * W produkcji integracja z Sanctum API (ciasteczka). Brak mocków.
      } catch (e) {
        console.error('[AuthContext] ⚠️ localStorage NIE jest dostępny! Prawdopodobnie problem z certyfikatem HTTPS.', e);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));

  const login = (userData: User, authToken?: string) => {
    setUser(userData);
    if (authToken) {
      setToken(authToken);
      localStorage.setItem('auth_token', authToken);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
  };
      {children}
    </AuthContext.Provider>
  );
};
