import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ManagerLoginScreen } from './ManagerLoginScreen';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, login } = useAuth();

  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('User not authenticated, showing login screen');
    return <ManagerLoginScreen onLoginSuccess={login} />;
  }

  console.log('User authenticated, rendering children');
  return <>{children}</>;
}
