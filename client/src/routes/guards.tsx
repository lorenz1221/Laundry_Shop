/**
 * Route guards — role-based portal access (mirrors server RBAC).
 * SECURITY COMPLIANCE CHECK: client-side role barrier before rendering admin/staff portals.
 */

import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '../types';

const ALLOWED: Record<User['role'], User['role'][]> = {
  customer: ['customer'],
  staff: ['staff', 'admin'],
  admin: ['admin', 'staff'],
};

export function RoleGuard({
  allowed,
  children,
  fallback,
}: {
  allowed: User['role'][];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { effectiveRole } = useAuth();
  if (!effectiveRole || !allowed.includes(effectiveRole)) {
    return <>{fallback ?? null}</>;
  }
  return <>{children}</>;
}

export function canAccessRole(viewer: User['role'] | null, target: User['role']): boolean {
  if (!viewer) return false;
  return ALLOWED[viewer]?.includes(target) ?? false;
}
