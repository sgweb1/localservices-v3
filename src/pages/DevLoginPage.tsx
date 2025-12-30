import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Shield, Briefcase, LogOut, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

/**
 * DEV Login Page
 * 
 * Strona testowego logowania - tylko DEV mode.
 * Pozwala szybko przełączać się między różnymi użytkownikami przez quick login API.
 * Bez potrzeby haseł - używa HMAC-signed quick_token.
 */
export const DevLoginPage: React.FC = () => {
  const { user, login, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [providers, setProviders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Skąd użytkownik został przekierowany (np. z ProtectedRoute)
  const from = (location.state as any)?.from?.pathname || null;

  // Fetch users from quick login endpoint
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        setError(null);

        // Fetch first provider, customer, and admin
        const [providerRes, customerRes, adminRes] = await Promise.all([
          axios.post('/api/v1/dev/quick-login', { role: 'provider' }, { withCredentials: true }).catch(() => null),
          axios.post('/api/v1/dev/quick-login', { role: 'customer' }, { withCredentials: true }).catch(() => null),
          axios.post('/api/v1/dev/quick-login', { role: 'admin' }, { withCredentials: true }).catch(() => null),
        ]);

        const providerUsers = providerRes?.data?.user ? [providerRes.data.user] : [];
        const customerUsers = customerRes?.data?.user ? [customerRes.data.user] : [];
        const adminUsers = adminRes?.data?.user ? [adminRes.data.user] : [];

        setProviders(providerUsers);
        setCustomers(customerUsers);
        setAdmins(adminUsers);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Failed to load users. Make sure the quick login API is working.');
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const handleLogin = async (role: string) => {
    setIsLoggingIn(true);
    try {
      const response = await axios.post('/api/v1/dev/quick-login', { role }, { withCredentials: true });
      
      if (response.data.success && response.data.token) {
        const userData = response.data.user;
        const token = response.data.token;

        // Save token to localStorage and login
        localStorage.setItem('auth_token', token);
        login(userData, token);

        // Redirect based on role
        if (from && role === 'provider' && from.startsWith('/provider')) {
          navigate(from);
        } else if (role === 'provider') {
          navigate('/provider/dashboard');
        } else if (role === 'admin') {
          navigate('/');
        } else {
          navigate('/szukaj');
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please try again.');
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
              <p className="text-sm text-gray-500">Quick user switching (no password required)</p>
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

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border-2 border-red-300 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">{error}</p>
              <p className="text-sm text-red-700 mt-1">Make sure the backend is running and the quick login API endpoint is available.</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loadingUsers ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            <p className="ml-3 text-gray-600">Loading users...</p>
          </div>
        ) : (
          <>
            {/* Providers Section */}
            {providers.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Briefcase className="w-6 h-6 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">Provider</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {providers.map((userData) => {
                    const Icon = getRoleIcon('provider');
                    const isActive = user?.id === userData.id;
                    
                    return (
                      <button
                        key={userData.id}
                        onClick={() => handleLogin('provider')}
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
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRoleColor('provider')} flex items-center justify-center flex-shrink-0`}>
                            {isLoggingIn && !isActive ? (
                              <Loader2 className="w-6 h-6 text-white animate-spin" />
                            ) : (
                              <Icon className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-gray-900 truncate">{userData.name}</p>
                              {isActive && <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />}
                            </div>
                            <p className="text-xs text-gray-500 truncate mb-2">{userData.email}</p>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleBadgeColor('provider')}`}>
                              Provider #{userData.id}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Customers Section */}
            {customers.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-6 h-6 text-gray-600" />
                  <h2 className="text-xl font-bold text-gray-900">Customer</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customers.map((userData) => {
                    const Icon = getRoleIcon('customer');
                    const isActive = user?.id === userData.id;
                    
                    return (
                      <button
                        key={userData.id}
                        onClick={() => handleLogin('customer')}
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
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRoleColor('customer')} flex items-center justify-center flex-shrink-0`}>
                            {isLoggingIn && !isActive ? (
                              <Loader2 className="w-6 h-6 text-white animate-spin" />
                            ) : (
                              <Icon className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-gray-900 truncate">{userData.name}</p>
                              {isActive && <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />}
                            </div>
                            <p className="text-xs text-gray-500 truncate mb-2">{userData.email}</p>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleBadgeColor('customer')}`}>
                              Customer #{userData.id}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Admin Section */}
            {admins.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-bold text-gray-900">Admin</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {admins.map((userData) => {
                    const Icon = getRoleIcon('admin');
                    const isActive = user?.id === userData.id;
                    
                    return (
                      <button
                        key={userData.id}
                        onClick={() => handleLogin('admin')}
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
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRoleColor('admin')} flex items-center justify-center flex-shrink-0`}>
                            {isLoggingIn && !isActive ? (
                              <Loader2 className="w-6 h-6 text-white animate-spin" />
                            ) : (
                              <Icon className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-gray-900 truncate">{userData.name}</p>
                              {isActive && <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />}
                            </div>
                            <p className="text-xs text-gray-500 truncate mb-2">{userData.email}</p>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleBadgeColor('admin')}`}>
                              Administrator
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Info Footer */}
            <div className="mt-8 p-6 bg-white rounded-2xl border-2 border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2">ℹ️ Informacje</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Kliknij użytkownika aby się zalogować (POST <code className="bg-gray-100 px-2 py-0.5 rounded">/api/v1/dev/quick-login</code>)</li>
                <li>• Nie wymagane hasło - używa HMAC-signed quick_token</li>
                <li>• Provider zostanie przekierowany do <code className="bg-gray-100 px-2 py-0.5 rounded">/provider/dashboard</code></li>
                <li>• Customer zostanie przekierowany do <code className="bg-gray-100 px-2 py-0.5 rounded">/szukaj</code></li>
                <li>• Logowanie tworzy prawdziwą sesję z real database</li>
                <li>• Wszystkie dane pochodzą z produkcyjnej bazy danych</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
