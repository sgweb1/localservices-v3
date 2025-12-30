import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'provider' | 'admin' | 'customer';
}

/**
 * Komponent zabezpieczający route przed nieautoryzowanym dostępem.
 * Przekierowuje do /dev/login jeśli użytkownik nie jest zalogowany
 * lub nie ma odpowiedniej roli.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, isInitialized } = useAuth();
  const location = useLocation();

  // Czekaj aż auth się zainicjalizuje
  if (!isInitialized) {
    return <Spinner />;
  }

  if (!isAuthenticated || !user) {
    // Przekieruj do logowania, zapamiętaj gdzie chciał iść
    return <Navigate to="/dev/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Użytkownik zalogowany ale nie ma odpowiedniej roli
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
