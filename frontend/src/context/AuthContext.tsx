/**
 * AuthContext — manages PHP session state and Dev Mode role override.
 * On login success, stores user from /api/login.php (users.role field).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createDevUser,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from '../services/api';
import type { LoginPayload, RegisterPayload, User } from '../types';

interface AuthContextValue {
  user: User | null;
  /** Effective role — Dev Mode override or DB session role */
  effectiveRole: User['role'] | null;
  isLoading: boolean;
  isDevMode: boolean;
  devRole: User['role'];
  login: (payload: LoginPayload) => Promise<string>;
  register: (payload: RegisterPayload) => Promise<string>;
  logout: () => Promise<void>;
  setDevMode: (enabled: boolean) => void;
  setDevRole: (role: User['role']) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDevMode, setIsDevMode] = useState(false);
  const [devRole, setDevRole] = useState<User['role']>('customer');

  // Restore session from PHP on mount via GET /api/me.php
  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        if (res.success && res.user) setUser(res.user);
      })
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await loginUser(payload);
    if (res.user) {
      setUser(res.user);
      setIsDevMode(false);
    }
    return res.message ?? 'Login successful.';
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await registerUser(payload);
    return res.message ?? 'Account created.';
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      setIsDevMode(false);
    }
  }, []);

  const effectiveRole = useMemo(() => {
    if (isDevMode) return devRole;
    return user?.role ?? null;
  }, [isDevMode, devRole, user]);

  const effectiveUser = useMemo(() => {
    if (isDevMode) return createDevUser(devRole);
    return user;
  }, [isDevMode, devRole, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: effectiveUser,
      effectiveRole,
      isLoading,
      isDevMode,
      devRole,
      login,
      register,
      logout,
      setDevMode: setIsDevMode,
      setDevRole,
    }),
    [effectiveUser, effectiveRole, isLoading, isDevMode, devRole, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
