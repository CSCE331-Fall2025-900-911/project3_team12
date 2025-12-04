import { ReactNode, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ManagerLoginScreen } from './ManagerLoginScreen';
import { Alert, AlertDescription } from './ui/alert';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, login } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);

  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  const handleLogin = async (credential: string) => {
    try {
      setLoginError(null);
      await login(credential);
    } catch (error: any) {
      console.error('Login failed:', error);
      setLoginError(error.message || 'Login failed. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('User not authenticated, showing login screen');
    return (
      <div>
        {loginError && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
            <Alert variant="destructive">
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          </div>
        )}
        <ManagerLoginScreen onLoginSuccess={handleLogin} />
      </div>
    );
  }

  console.log('User authenticated, rendering children');
  return <>{children}</>;
}
