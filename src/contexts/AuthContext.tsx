import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credential: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem('manager_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (credential: string) => {
    try {
      setIsLoading(true);
      
      // Verify with backend first (this checks if user is a manager)
      const apiUrl = import.meta.env.PROD 
        ? '/api' 
        : 'http://localhost:3001/api';
      
      const response = await fetch(`${apiUrl}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Authentication failed');
      }

      const backendData = await response.json();
      
      const userData: User = {
        email: backendData.email,
        name: backendData.name,
        picture: backendData.picture,
      };

      console.log('Login successful:', userData);
      setUser(userData);
      localStorage.setItem('manager_user', JSON.stringify(userData));
      localStorage.setItem('manager_token', credential);
    } catch (error) {
      console.error('Login error:', error);
      // Clear any stored data on failed login
      localStorage.removeItem('manager_user');
      localStorage.removeItem('manager_token');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('manager_user');
    localStorage.removeItem('manager_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
