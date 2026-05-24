/**
 * API service layer — fetch hooks to laundryshop_db via PHP endpoints.
 */

import { apiFetch } from '../api/apiHandler';
import type {
  ApiResponse,
  CreateOrderPayload,
  InventoryItem,
  LoginPayload,
  Order,
  OrderStatus,
  PaymentStatus,
  RegisterPayload,
  User,
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
