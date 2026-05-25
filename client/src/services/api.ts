/**
 * Service layer — Spinzone API via Laravel (server/public/api).
 */

import { apiHandler } from '../api/apiHandler';
import type {
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
} from '../types';

export async function registerUser(payload: RegisterPayload): Promise<ApiResponse> {
  return apiHandler<ApiResponse>({ url: '/register', method: 'POST', data: payload });
}

export async function loginUser(payload: LoginPayload): Promise<ApiResponse> {
  return apiHandler<ApiResponse>({ url: '/login', method: 'POST', data: payload });
}

export async function logoutUser(): Promise<ApiResponse> {
  return apiHandler<ApiResponse>({ url: '/logout', method: 'POST' });
}

export async function getCurrentUser(): Promise<ApiResponse> {
  return apiHandler<ApiResponse>({ url: '/me', method: 'GET' });
}

export async function fetchActiveOrders(): Promise<Order[]> {
  const data = await apiHandler<ApiResponse>({ url: '/orders?view=active', method: 'GET' });
  return data.orders ?? [];
}

export async function fetchLedgerOrders(): Promise<Order[]> {
  const data = await apiHandler<ApiResponse>({ url: '/orders?view=ledger', method: 'GET' });
  return data.orders ?? [];
}

export async function fetchCustomerOrders(): Promise<Order[]> {
  const data = await apiHandler<ApiResponse>({ url: '/orders', method: 'GET' });
  return data.orders ?? [];
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const data = await apiHandler<ApiResponse>({ url: '/orders', method: 'POST', data: payload });
  if (!data.order) throw new Error('Order creation failed');
  return data.order;
}

export async function updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order> {
  const data = await apiHandler<ApiResponse>({
    url: `/orders/${orderId}`,
    method: 'PATCH',
    data: { status },
  });
  if (!data.order) throw new Error('Status update failed');
  return data.order;
}

export async function updatePaymentStatus(
  orderId: number,
  paymentStatus: PaymentStatus,
): Promise<Order> {
  const data = await apiHandler<ApiResponse>({
    url: `/orders/${orderId}/payment`,
    method: 'PATCH',
    data: { paymentStatus },
  });
  if (!data.order) throw new Error('Payment update failed');
  return data.order;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const data = await apiHandler<ApiResponse>({ url: '/dashboard/stats', method: 'GET' });
  if (!data.stats) throw new Error('Stats unavailable');
  return data.stats;
}

export async function fetchInventory(): Promise<InventoryItem[]> {
  const data = await apiHandler<ApiResponse>({ url: '/inventory', method: 'GET' });
  return data.inventory ?? [];
}

export function createDevUser(role: User['role']): User {
  return {
    id: role === 'admin' ? 997 : role === 'staff' ? 999 : 998,
    name: role === 'admin' ? 'Dev Admin' : role === 'staff' ? 'Dev Staff' : 'Dev Customer',
    email:
      role === 'admin'
        ? 'dev.admin@spinzone.local'
        : role === 'staff'
          ? 'dev.staff@spinzone.local'
          : 'dev.customer@spinzone.local',
    role,
  };
}
