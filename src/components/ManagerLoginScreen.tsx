import { GoogleLogin } from '@react-oauth/google';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { useState } from 'react';

interface ManagerLoginScreenProps {
  onLoginSuccess: (credential: string) => void;
}

export function ManagerLoginScreen({ onLoginSuccess }: ManagerLoginScreenProps) {
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = (credentialResponse: any) => {
    if (credentialResponse.credential) {
      setError(null);
      onLoginSuccess(credentialResponse.credential);
    } else {
      setError('Failed to receive credentials from Google');
    }
  };

  const handleError = () => {
    setError('Login failed. Please try again.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Manager Login</CardTitle>
          <CardDescription className="text-base">
            Sign in with your Google account to access the manager dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex justify-center py-6">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              useOneTap
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
            />
          </div>
          <div className="text-center text-sm text-gray-500">
            <p>Only authorized managers can access this system</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
