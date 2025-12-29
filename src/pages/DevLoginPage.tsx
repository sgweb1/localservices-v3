import React, { useState } from 'react';
import { useAuth, MOCK_USERS } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Shield, Briefcase, LogOut, CheckCircle2, Loader2 } from 'lucide-react';
import axios from 'axios';

/**
 * DEV Login Page
 * 
 * Strona testowego logowania - tylko DEV mode.
 * Pozwala szybko przełączać się między różnymi użytkownikami.
 * Używa prawdziwego endpointu POST /api/v1/login (email + password).
 */
export const DevLoginPage: React.FC = () => {
  const { user, login, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Skąd użytkownik został przekierowany (np. z ProtectedRoute)
  const from = (location.state as any)?.from?.pathname || null;

  const handleLogin = async (mockUser: typeof MOCK_USERS[0]) => {
    setIsLoggingIn(true);
    try {
      // W DEV: tylko zapisz lokalnie, bez prawdziwego API logowania
      // MockAuthMiddleware na backendzie obsłuży autoryzację przez Bearer token
      if (import.meta.env.DEV) {
        login(mockUser);
        
        // Redirect - wróć tam skąd przyszedł lub domyślna strona dla roli
        if (from && mockUser.role === 'provider' && from.startsWith('/provider')) {
          navigate(from);
        } else if (mockUser.role === 'provider') {
          navigate('/provider/dashboard');
        } else if (mockUser.role === 'admin') {
          navigate('/');
        } else {
          navigate('/szukaj');
        }
      } else {
        // PROD: prawdziwe logowanie przez Sanctum
        // 1. Pobierz CSRF cookie
        await axios.get(`/sanctum/csrf-cookie`, { withCredentials: true });
        
        // 2. Zaloguj przez prawdziwy endpoint Sanctum
        await axios.post(`/api/v1/login`, {
          email: mockUser.email,
          password: mockUser.password || 'password',
        }, { withCredentials: true });
        
        // 3. Zapisz lokalnie w React state
        login(mockUser);
        
        // 4. Redirect
        if (from && mockUser.role === 'provider' && from.startsWith('/provider')) {
          navigate(from);
        } else if (mockUser.role === 'provider') {
          navigate('/provider/dashboard');
        } else if (mockUser.role === 'admin') {
          navigate('/');
        } else {
          navigate('/szukaj');
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Błąd logowania. Sprawdź email/hasło w konsoli.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'provider': return Briefcase;
      case 'admin': return Shield;
      default: return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'provider': return 'from-primary-600 to-accent-600';
      case 'admin': return 'from-purple-600 to-pink-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'provider': return 'bg-primary-100 text-primary-700';
      case 'admin': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const providers = MOCK_USERS.filter(u => u.role === 'provider');
  const customers = MOCK_USERS.filter(u => u.role === 'customer');
  const admins = MOCK_USERS.filter(u => u.role === 'admin');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-900">DEV Login</h1>
              <p className="text-sm text-gray-500">Quick user switching for development</p>
            </div>
          </div>

          {/* Current User Badge */}
          {isAuthenticated && user && (
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-lg border-2 border-success">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <div className="text-left">
                <p className="text-xs text-gray-500">Zalogowany jako:</p>
                <p className="font-bold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-600">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-4 p-2 rounded-xl hover:bg-gray-100 text-error transition-colors"
                title="Wyloguj"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Providers Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">Providers ({providers.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.map((mockUser) => {
              const Icon = getRoleIcon(mockUser.role);
              const isActive = user?.id === mockUser.id;
              
              return (
                <button
                  key={mockUser.id}
                  onClick={() => handleLogin(mockUser)}
                  disabled={isActive || isLoggingIn}
                  className={`p-4 rounded-2xl border-2 transition-all text-left ${
                    isActive
                      ? 'border-success bg-success/5 cursor-not-allowed'
                      : isLoggingIn
                      ? 'border-gray-300 bg-gray-50 cursor-wait opacity-50'
                      : 'border-gray-200 bg-white hover:border-primary-400 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRoleColor(mockUser.role)} flex items-center justify-center flex-shrink-0`}>
                      {isLoggingIn && !isActive ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : (
                        <Icon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-gray-900 truncate">{mockUser.name}</p>
                        {isActive && <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 truncate mb-2">{mockUser.email}</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleBadgeColor(mockUser.role)}`}>
                        Provider #{mockUser.id}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Customers Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Customers ({customers.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((mockUser) => {
              const Icon = getRoleIcon(mockUser.role);
              const isActive = user?.id === mockUser.id;
              
              return (
                <button
                  key={mockUser.id}
                  onClick={() => handleLogin(mockUser)}
                  disabled={isActive || isLoggingIn}
                  className={`p-4 rounded-2xl border-2 transition-all text-left ${
                    isActive
                      ? 'border-success bg-success/5 cursor-not-allowed'
                      : isLoggingIn
                      ? 'border-gray-300 bg-gray-50 cursor-wait opacity-50'
                      : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRoleColor(mockUser.role)} flex items-center justify-center flex-shrink-0`}>
                      {isLoggingIn && !isActive ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : (
                        <Icon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-gray-900 truncate">{mockUser.name}</p>
                        {isActive && <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 truncate mb-2">{mockUser.email}</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleBadgeColor(mockUser.role)}`}>
                        Customer #{mockUser.id}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Admin Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Admin ({admins.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {admins.map((mockUser) => {
              const Icon = getRoleIcon(mockUser.role);
              const isActive = user?.id === mockUser.id;
              
              return (
                <button
                  key={mockUser.id}
                  onClick={() => handleLogin(mockUser)}
                  disabled={isActive || isLoggingIn}
                  className={`p-4 rounded-2xl border-2 transition-all text-left ${
                    isActive
                      ? 'border-success bg-success/5 cursor-not-allowed'
                      : isLoggingIn
                      ? 'border-gray-300 bg-gray-50 cursor-wait opacity-50'
                      : 'border-gray-200 bg-white hover:border-purple-400 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRoleColor(mockUser.role)} flex items-center justify-center flex-shrink-0`}>
                      {isLoggingIn && !isActive ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : (
                        <Icon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-gray-900 truncate">{mockUser.name}</p>
                        {isActive && <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 truncate mb-2">{mockUser.email}</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleBadgeColor(mockUser.role)}`}>
                        Administrator
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-8 p-6 bg-white rounded-2xl border-2 border-gray-200">
          <h3 className="font-bold text-gray-900 mb-2">ℹ️ Informacje</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Kliknij użytkownika aby się zalogować (POST <code className="bg-gray-100 px-2 py-0.5 rounded">/api/v1/login</code>)</li>
            <li>• Hasło dla wszystkich: <code className="bg-gray-100 px-2 py-0.5 rounded font-bold">password</code></li>
            <li>• Provider zostanie przekierowany do <code className="bg-gray-100 px-2 py-0.5 rounded">/provider/dashboard</code></li>
            <li>• Customer zostanie przekierowany do <code className="bg-gray-100 px-2 py-0.5 rounded">/szukaj</code></li>
            <li>• Logowanie tworzy prawdziwą sesję Sanctum (cookie-based SPA auth)</li>
            <li>• Użytkownicy pochodzą z bazy danych (UserSeeder)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
