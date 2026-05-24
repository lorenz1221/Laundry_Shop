/**
 * API service layer — fetch hooks to laundryshop_db via PHP endpoints.
 */

import { apiFetch } from '../api/apiHandler';
import type {
  ActivityLog,
  ApiResponse,
  CreateOrderPayload,
  DashboardStats,
  InventoryItem,
  LoginPayload,
  Order,
  OrderStatus,
  PaymentStatus,
  RegisterPayload,
  User,
  UserManagement,
} from '../types';

// DATABASE HOOK: POST register.php → users INSERT
export async function registerUser(payload: RegisterPayload): Promise<ApiResponse> {
  return apiFetch<ApiResponse>('/register.php', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// DATABASE HOOK: POST login.php → users SELECT + session
export async function loginUser(payload: LoginPayload): Promise<ApiResponse> {
  return apiFetch<ApiResponse>('/login.php', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function logoutUser(): Promise<ApiResponse> {
  return apiFetch<ApiResponse>('/logout.php', { method: 'POST' });
}

export async function getCurrentUser(): Promise<ApiResponse> {
  return apiFetch<ApiResponse>('/me.php');
}

// DATABASE HOOK: GET orders.php — staff active queue (status != completed)
export async function fetchActiveOrders(): Promise<Order[]> {
  const data = await apiFetch<ApiResponse>('/orders.php?view=active');
  return data.orders ?? [];
}

// DATABASE HOOK: GET orders.php?view=ledger — all orders incl. completed
export async function fetchLedgerOrders(): Promise<Order[]> {
  const data = await apiFetch<ApiResponse>('/orders.php?view=ledger');
  return data.orders ?? [];
}

// DATABASE HOOK: GET orders.php — customer own rows
export async function fetchCustomerOrders(): Promise<Order[]> {
  const data = await apiFetch<ApiResponse>('/orders.php');
  return data.orders ?? [];
}

// DATABASE HOOK: POST orders.php → orders INSERT + inventory deduct
export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const data = await apiFetch<ApiResponse>('/orders.php', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!data.order) throw new Error('Order creation failed');
  return data.order;
}

// DATABASE HOOK: PATCH orders.php?id — UPDATE orders.status
export async function updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order> {
  const data = await apiFetch<ApiResponse>(`/orders.php?id=${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  if (!data.order) throw new Error('Status update failed');
  return data.order;
}

// DATABASE HOOK: PATCH orders.php?id — UPDATE orders.payment_status
export async function updatePaymentStatus(orderId: number, paymentStatus: PaymentStatus): Promise<Order> {
  const data = await apiFetch<ApiResponse>(`/orders.php?id=${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify({ paymentStatus }),
  });
  if (!data.order) throw new Error('Payment status update failed');
  return data.order;
}

// DATABASE HOOK: GET inventory.php → inventory table
export async function fetchInventory(): Promise<InventoryItem[]> {
  const data = await apiFetch<ApiResponse>('/inventory.php');
  return data.inventory ?? [];
}

export function createDevUser(role: User['role']): User {
  return {
    id: role === 'staff' ? 999 : 998,
    name: role === 'staff' ? 'Dev Staff' : 'Dev Customer',
    email: role === 'staff' ? 'dev.staff@spinzone.local' : 'dev.customer@spinzone.local',
    role,
  };
}

/** @deprecated use fetchActiveOrders or fetchCustomerOrders */
export async function fetchOrders(): Promise<Order[]> {
  return fetchActiveOrders();
}

// ============ EXECUTIVE ANALYTICS ============

// DATABASE HOOK: GET orders.php?view=stats — dashboard metrics
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const data = await apiFetch<{ success: boolean; stats: DashboardStats }>('/orders.php?view=stats');
  return data.stats;
}

// ============ USER MANAGEMENT ============

export interface UsersResponse {
  success: boolean;
  users: UserManagement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    showing: { from: number; to: number };
  };
}

// DATABASE HOOK: GET users.php — paginated user list
export async function fetchUsers(page = 1, limit = 10, search = ''): Promise<UsersResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.set('search', search);
  return apiFetch<UsersResponse>(`/users.php?${params}`);
}

// DATABASE HOOK: POST users.php — create user
export async function createUser(payload: { name: string; email: string; password: string; role: string }): Promise<ApiResponse> {
  return apiFetch<ApiResponse>('/users.php', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// DATABASE HOOK: PATCH users.php?id — update user
export async function updateUser(userId: number, payload: Partial<{ name: string; email: string; password: string; role: string }>): Promise<ApiResponse> {
  return apiFetch<ApiResponse>(`/users.php?id=${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

// DATABASE HOOK: DELETE users.php?id — delete user
export async function deleteUser(userId: number, permanent = false): Promise<ApiResponse> {
  return apiFetch<ApiResponse>(`/users.php?id=${userId}&permanent=${permanent}`, {
    method: 'DELETE',
  });
}

// ============ ACTIVITY LOGS ============

export interface ActivityLogsResponse {
  success: boolean;
  logs: ActivityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    showing: { from: number; to: number };
  };
}

// DATABASE HOOK: GET activity_logs.php — paginated activity logs
export async function fetchActivityLogs(page = 1, limit = 10, eventType = ''): Promise<ActivityLogsResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (eventType) params.set('eventType', eventType);
  return apiFetch<ActivityLogsResponse>(`/activity_logs.php?${params}`);
}
