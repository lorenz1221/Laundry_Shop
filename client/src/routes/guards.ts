/**
 * Route guards for authentication and authorization
 */

import type { User } from '../types';

export function isAuthenticated(user: User | null): boolean {
  return user !== null;
}

export function isStaff(user: User | null): boolean {
  return user?.role === 'staff';
}

export function isCustomer(user: User | null): boolean {
  return user?.role === 'customer';
}

export function canAccessStaffRoutes(user: User | null): boolean {
  return isAuthenticated(user) && isStaff(user);
}

export function canAccessCustomerRoutes(user: User | null): boolean {
  return isAuthenticated(user) && isCustomer(user);
}
