/**
 * Premium split-screen auth gateway — POST /api/login.php & /api/register.php
 */

import { useState, type FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import FloatingInput from '../ui/FloatingInput';
import WarningBanner from '../ui/WarningBanner';

type AuthTab = 'signin' | 'register';

const MailIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const UserIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export default function AuthPage() {
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState<AuthTab>('signin');
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState('');

  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regRole, setRegRole] = useState<'customer' | 'staff'>('customer');

  const flashWarning = (msg: string) => {
    setWarning(msg);
    showToast('warning', msg);
    window.setTimeout(() => setWarning(''), 4000);
  };

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!signInEmail.trim() || !signInPassword) {
      flashWarning('Email and password are required.');
      return;
    }
    setLoading(true);
    try {
      // DATABASE HOOK: login.php → users table
      await login({ email: signInEmail, password: signInPassword });
      showToast('success', 'Welcome back! Login successful.');
    } catch (err) {
      flashWarning(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      flashWarning('All fields are required.');
      return;
    }
    if (regPassword !== regConfirm) {
      flashWarning('Passwords do not match. Please re-enter.');
      return;
    }
    setLoading(true);
    try {
      // DATABASE HOOK: register.php → users INSERT
      await register({ name: regName, email: regEmail, password: regPassword, role: regRole });
      showToast('success', 'Account created! You can now sign in.');
      setTab('signin');
      setSignInEmail(regEmail);
    } catch (err) {
      flashWarning(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left 60% — wave hero (hidden mobile) */}
      <aside className="relative hidden w-[60%] overflow-hidden bg-gradient-to-br from-brand-900 via-slate-900 to-spin-600 lg:flex lg:flex-col lg:justify-center lg:px-16">
        <div className="auth-waves pointer-events-none absolute inset-0 opacity-40" aria-hidden />
        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
            Spinzone: Freshness, Managed Flawlessly.
          </h1>
          <p className="mt-4 text-lg text-blue-100/90">
            Track every load from queue to pickup. Branch staff stay in sync with real-time operations.
          </p>
        </div>
      </aside>

      {/* Right 40% — auth card */}
      <div className="flex w-full flex-col items-center justify-center bg-slate-50 px-6 py-12 lg:w-[40%]">
        <div className="w-full max-w-md">
          {/* Glowing ring logo */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse-glow rounded-full bg-brand-400/30 blur-xl" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-brand-200 bg-white shadow-lg ring-4 ring-brand-100">
                <svg className="h-10 w-10 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-xl shadow-slate-200/50 backdrop-blur-sm">
            {/* Sliding tab indicator */}
            <div className="relative mb-8 flex rounded-xl bg-slate-100 p-1">
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-white shadow transition-all duration-300 ${
                  tab === 'signin' ? 'left-1' : 'left-[calc(50%+2px)]'
                }`}
              />
              {(['signin', 'register'] as AuthTab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTab(t); setWarning(''); }}
                  className={`relative z-10 flex-1 py-2.5 text-sm font-semibold transition ${
                    tab === t ? 'text-brand-700' : 'text-slate-500'
                  }`}
                >
                  {t === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            {warning && <WarningBanner message={warning} className="mb-4" />}

            {tab === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-5">
                <FloatingInput label="Email" type="email" icon={<MailIcon />} value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)} required />
                <FloatingInput label="Password" icon={<LockIcon />} showToggle value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)} required />
                <button type="submit" disabled={loading}
                  className="w-full rounded-xl bg-brand-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-700 disabled:opacity-60">
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <FloatingInput label="Full Name" icon={<UserIcon />} value={regName}
                  onChange={(e) => setRegName(e.target.value)} required />
                <FloatingInput label="Email" type="email" icon={<MailIcon />} value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)} required />
                <FloatingInput label="Password" icon={<LockIcon />} showToggle value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)} required minLength={6} />
                <FloatingInput label="Confirm Password" icon={<LockIcon />} showToggle value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)} required />
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Account Role</label>
                  <select value={regRole} onChange={(e) => setRegRole(e.target.value as 'customer' | 'staff')}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500">
                    <option value="customer">Customer</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full rounded-xl bg-brand-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-700 disabled:opacity-60">
                  {loading ? 'Creating…' : 'Create Account'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
