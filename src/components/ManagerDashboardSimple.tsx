import { useAuth } from '../contexts/AuthContext';
import { ManagerHeader } from './ManagerHeader';

export function ManagerDashboardSimple() {
  const { user } = useAuth();

  console.log('ManagerDashboardSimple rendering with user:', user);

  return (
    <div className="min-h-screen bg-gray-50">
      <ManagerHeader />
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Manager Dashboard</h1>
          <p className="text-gray-600">Welcome, {user?.name || 'Manager'}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Test Content</h2>
          <p>If you can see this, the dashboard is rendering correctly!</p>
          <p className="mt-4">User email: {user?.email}</p>
        </div>
      </div>
    </div>
  );
}
