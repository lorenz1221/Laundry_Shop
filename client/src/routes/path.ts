/**
 * Route path constants
 */

export const PATHS = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  CUSTOMER: {
    DASHBOARD: '/customer',
    BOOKING: '/customer/booking',
    ORDERS: '/customer/orders',
  },
  STAFF: {
    DASHBOARD: '/staff',
    QUEUE: '/staff/queue',
    INVENTORY: '/staff/inventory',
    LEDGER: '/staff/ledger',
  },
} as const;

export default PATHS;
