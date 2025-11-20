import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';

export function ManagerHeader() {
  const { user, logout } = useAuth();

  console.log('ManagerHeader rendering with user:', user);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-800">Manager Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <Button onClick={logout} variant="outline" size="sm">
                Sign Out
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
