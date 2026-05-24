/**
 * Developer session switch — bottom-right, blurred, toggles customer/staff viewport.
 */

import { useAuth } from '../contexts/AuthContext';

export default function DevModeSwitch() {
  const { isDevMode, devRole, setDevMode, setDevRole, user } = useAuth();

  return (
    <div className="fixed bottom-20 right-4 z-[60] lg:bottom-6">
      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 px-4 py-3 shadow-xl backdrop-blur-md">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
            Dev Session
          </span>
          <span className="text-[10px] text-amber-700">
            {isDevMode ? `Preview: ${devRole}` : user ? `Live: ${user.role}` : 'Off'}
          </span>
        </div>
        <label className="mb-2 flex cursor-pointer items-center gap-2 text-xs font-medium text-amber-900">
          <input
            type="checkbox"
            checked={isDevMode}
            onChange={(e) => setDevMode(e.target.checked)}
            className="rounded border-amber-400"
          />
          Enable test viewport
        </label>
        {isDevMode && (
          <div className="flex gap-1 rounded-lg bg-white/50 p-0.5">
            {(['customer', 'staff'] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setDevRole(role)}
                className={`rounded-md px-2.5 py-1 text-[10px] font-bold capitalize ${
                  devRole === role ? 'bg-amber-500 text-white' : 'text-amber-800'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
