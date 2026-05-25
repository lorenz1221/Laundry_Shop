import { useAuth } from '../contexts/AuthContext';
import AuthPage from '../pages/AuthPage';
import AdminDashboard from '../pages/AdminDashboard';
import CustomerDashboard from '../pages/CustomerDashboard';
export default function AppRoutes() {
  const { user, effectiveRole, isLoading, isDevMode } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-400">Loading Spinzone…</div>
      </div>
    );
  }

  const showDashboard = user !== null || isDevMode;
  if (!showDashboard) return <AuthPage />;

  // Staff and admin both use the Admin Command Center
  if (effectiveRole === 'admin' || effectiveRole === 'staff') return <AdminDashboard />;
  return <CustomerDashboard />;
}
