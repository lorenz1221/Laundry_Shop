/**
 * App root — routes between AuthPage and role-based dashboards.
 * Reads users.role from PHP session (or Dev Mode override).
 */

import { useAuth } from './context/AuthContext';
import AuthPage from './components/auth/AuthPage';
import DevModeSwitch from './components/DevModeSwitch';
import CustomerDashboard from './components/customer/CustomerDashboard';
import StaffDashboard from './components/staff/StaffDashboard';

function App() {
  const { user, effectiveRole, isLoading, isDevMode } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-400">Loading Spinzone…</div>
      </div>
    );
  }

  const showDashboard = user !== null || isDevMode;

  return (
    <>
      {!showDashboard && <AuthPage />}
      {showDashboard && effectiveRole === 'customer' && <CustomerDashboard />}
      {showDashboard && effectiveRole === 'staff' && <StaffDashboard />}
      <DevModeSwitch />
    </>
  );
}

export default App;
