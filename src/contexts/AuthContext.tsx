import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'provider' | 'admin';
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (user: User, authToken?: string) => void;
  logout: () => void;
  isInitialized: boolean;
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
 * Integracja z Sanctum API (ciasteczka) + optional quick-login token.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('auth_token');
    } catch {
      return null;
    }
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Na inicjalizacji, spróbuj wczytać user data jeśli token istnieje
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
          setToken(storedToken);
          
          // Fetch user data from API
          const response = await axios.get('/api/v1/user', {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          
          if (response.data?.user) {
            const userData = response.data.user;
            setUser({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.user_type || 'customer'
            });
          }
        }
      } catch (err) {
        // Token invalid or user data cannot be fetched
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData: User, authToken?: string) => {
    setUser(userData);
    if (authToken) {
      setToken(authToken);
      try {
        localStorage.setItem('auth_token', authToken);
      } catch (e) {
        console.warn('Cannot save auth_token to localStorage:', e);
      }
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem('auth_token');
    } catch (e) {
      console.warn('Cannot remove auth_token from localStorage:', e);
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
        isInitialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
