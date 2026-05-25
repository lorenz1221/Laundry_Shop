/**
 * Core TypeScript interfaces — strict mapping to laundryshop_db tables & API JSON.
 */

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'staff' | 'admin'; // staff kept for legacy sessions; routes as admin
}

/** orders.status ENUM in laundryshop_db */
export type OrderStatus = 'queue' | 'washing' | 'drying' | 'ready' | 'completed';

export type ServiceType = 'wash-dry-fold' | 'wash-dry-press' | 'premium-care';
export type FulfillmentType = 'dropoff' | 'delivery';
export type PaymentStatus = 'pending' | 'paid';

export interface Order {
  id: number;
  customerId: number | null;
  customerName: string;
  contactPhone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  specialNotes: string | null;
  weightKg: number;
  serviceType: ServiceType;
  scheduledDate: string | null;
  scheduledTime: string | null;
  fulfillmentType: FulfillmentType;
  status: OrderStatus;
  totalFee: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface InventoryItem {
  id: number;
  itemName: string;
  currentLevel: number;
  maxLevel: number;
  unit: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'admin';
  recaptchaToken?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  recaptchaToken?: string;
}

export interface CreateOrderPayload {
  customerName?: string;
  contactPhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  specialNotes?: string;
  weightKg: number;
  serviceType: ServiceType;
  scheduledDate?: string;
  scheduledTime?: string;
  fulfillmentType: FulfillmentType;
  paymentStatus?: PaymentStatus;
}

export interface DashboardStats {
  totalRevenue: number;
  totalKilograms: number;
  activeCustomers: number;
  activeOrders: number;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  user?: User;
  orders?: Order[];
  order?: Order;
  inventory?: InventoryItem[];
  stats?: DashboardStats;
}

/** Customer journey — 4 visible steps (excludes completed) */
export const JOURNEY_STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'queue', label: 'In the Queue' },
  { key: 'washing', label: 'Washing' },
  { key: 'drying', label: 'Drying' },
  { key: 'ready', label: 'Ready for Pickup' },
];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  queue: 'In the Queue',
  washing: 'Washing',
  drying: 'Drying',
  ready: 'Ready for Pickup',
  completed: 'Completed',
};

export type StaffFilterTab = 'all' | 'washing' | 'drying' | 'ready';

export const STAFF_FILTER_TABS: { key: StaffFilterTab; label: string; status?: OrderStatus }[] = [
  { key: 'all', label: 'All Active' },
  { key: 'washing', label: 'Washing', status: 'washing' },
  { key: 'drying', label: 'Drying', status: 'drying' },
  { key: 'ready', label: 'Ready for Pickup', status: 'ready' },
];

export const SERVICE_OPTIONS: { value: ServiceType; label: string; rate: number }[] = [
  { value: 'wash-dry-fold', label: 'Wash-Dry-Fold', rate: 45 },
  { value: 'wash-dry-press', label: 'Wash-Dry-Press', rate: 65 },
  { value: 'premium-care', label: 'Premium Care', rate: 95 },
];

export const MAX_WEIGHT_KG = 50;
export const MIN_WEIGHT_KG = 0.5;
