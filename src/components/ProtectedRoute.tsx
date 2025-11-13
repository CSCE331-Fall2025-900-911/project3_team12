import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ManagerLoginScreen } from './ManagerLoginScreen';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <ManagerLoginScreen onLoginSuccess={login} />;
  }

  return <>{children}</>;
}
