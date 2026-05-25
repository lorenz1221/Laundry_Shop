# Laundry Shop Codebase Overview

## Architecture Summary
**Stack**: Laravel (PHP backend) + React + TypeScript (frontend)  
**Database**: MySQL (laundryshop_db)  
**Auth**: Session-based (PHP sessions, no Sanctum tokens)  
**Deployment**: Vite-built React SPA with Laravel API backend

---

## 1. Backend API Routes & Controllers

### API Endpoints (routes/api.php)
All routes are under `/api` prefix with `web` middleware (session-based auth).

#### Public Routes
- `POST /register` → AuthController::register
- `POST /login` → AuthController::login
- `GET /recaptcha/site-key` → RecaptchaController::siteKey

#### Authenticated Routes (require `auth` middleware)
- `GET /me` → Get current user
- `POST /logout` → Sign out
- **Orders**:
  - `GET /orders` → List (customers see own, staff/admin see all)
  - `POST /orders` → Create new order
  - `PATCH /orders/{id}` → Update order status
- **Inventory**:
  - `GET /inventory` → List consumables

#### Staff/Admin Routes (require `role:staff,admin` middleware)
- `PATCH /orders/{id}/payment` → Update payment status
- `GET /dashboard/stats` → Analytics (revenue, kg, customers, orders)

#### Legacy Routes
Support for `.php` filenames for backward compatibility.

### Controllers (app/Http/Controllers/Api/)

#### AuthController
```php
- register(Request): JsonResponse
  - Validates name, email, password, role (customer/admin only)
  - Verifies reCaptcha
  - Checks for SQL injection
  - Hashes password with bcrypt
  - Prevents duplicate emails
  - Logs activity

- login(Request): JsonResponse
  - Validates email/password
  - Verifies reCaptcha
  - Uses Hash::check for password verification
  - Creates session (Auth::login)
  - Returns User object (id, name, email, role)

- me(Request): JsonResponse
  - Returns authenticated user or null

- logout(Request): JsonResponse
  - Invalidates session
  - Regenerates CSRF token
```

**Security Features**:
- Password hashing: `PASSWORD_BCRYPT` (via Hash::make)
- SQL injection prevention: Eloquent prepared statements + SecurityService
- Session regeneration on login/logout
- reCaptcha verification on register/login

#### OrderController
```php
- index(Request)
  - Customers: Only their own orders
  - Staff/Admin: All orders (or ledger view if ?view=ledger)
  - Orders with status != 'completed' by default

- store(Request): Creates new order
  - Validates weight (0.5-50 kg), service type, fulfillment type
  - Calculates fee via OrderService::calculateFee()
  - Deducts inventory
  - Logs activity

- updateStatus(Request, int): Updates order status
  - Accepts: queue, washing, drying, ready, completed
```

#### Other Controllers
- **DashboardController::stats()** - Aggregates revenue, kg, customers, orders
- **PaymentController::update()** - Updates payment_status (pending/paid)
- **InventoryController::index()** - Lists consumables
- **RecaptchaController::siteKey()** - Returns reCaptcha public key

---

## 2. Database Schema (laundryshop_db)

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('customer', 'staff', 'admin') DEFAULT 'customer',
  phone VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Seed Data**:
- staff@spinzone.com (role: staff)
- admin@spinzone.com (role: admin)
- Default password: Same bcrypt hash for both

### Orders Table
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY,
  customer_id INT NULL (FK → users.id),
  customer_name VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50) NULL,
  address_line1 VARCHAR(255) NULL,
  address_line2 VARCHAR(255) NULL,
  special_notes TEXT NULL,
  weight_kg DECIMAL(6,2) NOT NULL,
  service_type ENUM('wash-dry-fold', 'wash-dry-press', 'premium-care') NOT NULL,
  scheduled_date DATE NULL,
  scheduled_time TIME NULL,
  fulfillment_type ENUM('dropoff', 'delivery') DEFAULT 'dropoff',
  status ENUM('queue', 'washing', 'drying', 'ready', 'completed') DEFAULT 'queue',
  total_fee DECIMAL(10,2) NOT NULL,
  payment_status ENUM('pending', 'paid') DEFAULT 'pending',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Inventory Table
```sql
CREATE TABLE inventory (
  id INT PRIMARY KEY,
  item_name VARCHAR(100) UNIQUE NOT NULL,
  current_level INT DEFAULT 100,
  max_level INT DEFAULT 100,
  unit VARCHAR(20) DEFAULT 'units',
  updated_at TIMESTAMP
);
```

**Seeded Items**: Detergent (85L/100L), Softener (72L/100L), Bleach (60L/100L)

### Activity Logs Table
```sql
CREATE TABLE activity_logs (
  id INT PRIMARY KEY,
  user_id INT NULL (FK → users.id),
  action VARCHAR(100) NOT NULL,
  details TEXT NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Tracked Actions**: REGISTER, LOGIN, LOGOUT, ORDER_CREATE, ORDER_STATUS

---

## 3. Frontend Structure & Pages

### Pages (src/pages/)

#### AuthPage (`AuthPage.tsx`)
- Public login/register form before authentication
- Uses reCaptcha widget
- Routes to appropriate dashboard after auth

#### CustomerDashboard (`CustomerDashboard.tsx`)
```tsx
Navigation:
- "My Journey" (overview) → StatusTracker component
- "Book Service" (booking) → BookingWidget component

Features:
- Polls fetchCustomerOrders() every 8s
- Displays active order (first non-completed or latest)
- Real-time status tracking through JOURNEY_STEPS
```

#### StaffDashboard (`StaffDashboard.tsx`)
```tsx
Navigation:
- "Active Queue" → OperationalQueue (non-completed orders)
- "Financial Ledger" → FinancialLedger (all orders)
- "Supplies" → InventoryMonitor

Data Flow:
- Polls every 10s
- fetchActiveOrders(), fetchLedgerOrders(), fetchInventory()
```

#### AdminDashboard (`AdminDashboard.tsx`)
```tsx
Navigation:
- "Overview" → AnalyticsCards + OperationalQueue
- "Active Queue" → OperationalQueue
- "Financial Ledger" → FinancialLedger
- "Supplies" → InventoryMonitor

Extra Features vs Staff:
- Analytics dashboard (revenue, kg, customers, orders)
- fetchDashboardStats() on overview
```

### Key Components

#### Layout Components
- **PortalLayout** (`components/layout/PortalLayout.tsx`)
  - Unified workspace shell with collapsible sidebar (desktop) + mobile tab bar
  - Sticky header with user name and logout button
  - Responsive navigation between sections
  - Accepts generic `PortalSection` type

#### Customer Components (`components/customer/`)
- **BookingWidget** - Order creation form
- **StatusTracker** - Displays order journey through JOURNEY_STEPS
- Both use FloatingInput component

#### Staff Components (`components/staff/`)
- **OperationalQueue** - Display/filter active orders by status
  - Filter tabs: All, Washing, Drying, Ready
  - Inline status update buttons
  - Order detail modal integration

- **FinancialLedger** - Payment status + fee tracking
  - Displays all orders with payment status badge
  - Payment status update capabilities

- **InventoryMonitor** - Consumable levels
  - Shows current/max levels
  - Visual progress indicators

#### UI Components (`components/ui/`)
- **FloatingInput** - Animated text input with floating label
  - Optional icon prefix
  - Optional password visibility toggle
  - Focus/blur animations

- **WarningBanner** - Alert/warning displays

#### Shared Components
- **AnalyticsCards** - 4-card dashboard widget
  - Total Revenue, Kilograms Processed, Active Customers, Active Orders
  - Gradient accent bars

- **PaymentBadge** - Displays pending/paid status
- **RecaptchaWidget** - Embeds reCaptcha iframe
- **order_modal** - Order detail view
- **DevModeSwitch** - Development mode toggle

### Routes (`src/routes/`)

#### Routes.tsx
```tsx
Flow:
1. Check if loading auth
2. If not authenticated → AuthPage
3. If staff/admin → AdminDashboard
4. If customer → CustomerDashboard

Key: effectiveRole handles dev mode override
```

#### guards.tsx
- **RoleGuard** component - Conditional rendering based on role
- **canAccessRole()** function - Role-based access validation

#### RootLayout.tsx
- Wraps entire app
- Provides AuthProvider and other context providers

#### path.ts
- Navigation path constants

---

## 4. Frontend Context & State Management

### AuthContext (`src/context/AuthContext.tsx`)

```tsx
State:
- user: User | null (from DB)
- isLoading: boolean
- isDevMode: boolean (allows role override)
- devRole: 'customer' | 'staff' | 'admin' (dev override)

Computed:
- effectiveRole: Uses devRole if isDevMode, else user.role

Methods:
- login(payload): Calls /login, sets user
- register(payload): Calls /register
- logout(): Calls /logout, clears user
- setDevMode(enabled): Toggle dev mode
- setDevRole(role): Set dev role override

Init:
- Calls getCurrentUser() on mount via GET /me
- Restores session from PHP
```

**Dev Mode**: Allows testing different roles without actual accounts. Creates fake users:
- Dev Customer (id: 998)
- Dev Staff (id: 999)
- Dev Admin (id: 997)

### Other Contexts
- **ThemeContext** - Light/dark theme (in contexts/)
- **ToastContext** - Toast notifications (in context/ and contexts/)

---

## 5. API Service Layer (src/services/api.ts)

### Authentication
```ts
registerUser(payload): Promise<ApiResponse>
loginUser(payload): Promise<ApiResponse>
logoutUser(): Promise<ApiResponse>
getCurrentUser(): Promise<ApiResponse>
```

### Orders
```ts
fetchActiveOrders(): Promise<Order[]>  // Non-completed
fetchLedgerOrders(): Promise<Order[]>   // All orders
fetchCustomerOrders(): Promise<Order[]> // User's own orders
createOrder(payload): Promise<Order>
updateOrderStatus(orderId, status): Promise<Order>
updatePaymentStatus(orderId, paymentStatus): Promise<Order>
```

### Dashboard & Inventory
```ts
fetchDashboardStats(): Promise<DashboardStats>
fetchInventory(): Promise<InventoryItem[]>
```

### API Handler
- Central error handling via `apiHandler<T>(config)`
- Wraps Axios with typed responses
- Extracts error messages from response.data.message

---

## 6. TypeScript Types (src/types/index.ts)

### Core Types
```ts
interface User {
  id: number
  name: string
  email: string
  role: 'customer' | 'staff' | 'admin'
}

type OrderStatus = 'queue' | 'washing' | 'drying' | 'ready' | 'completed'
type ServiceType = 'wash-dry-fold' | 'wash-dry-press' | 'premium-care'
type FulfillmentType = 'dropoff' | 'delivery'
type PaymentStatus = 'pending' | 'paid'

interface Order {
  id: number
  customerId: number | null
  customerName: string
  contactPhone: string | null
  weightKg: number
  serviceType: ServiceType
  status: OrderStatus
  totalFee: number
  paymentStatus: PaymentStatus
  createdAt: string
  // ... more fields
}

interface DashboardStats {
  totalRevenue: number
  totalKilograms: number
  activeCustomers: number
  activeOrders: number
}

interface InventoryItem {
  id: number
  itemName: string
  currentLevel: number
  maxLevel: number
  unit: string
}
```

### Constants
```ts
JOURNEY_STEPS       // Customer view: queue, washing, drying, ready
STATUS_LABELS       // Order status display text
STAFF_FILTER_TABS   // Staff queue filter options
SERVICE_OPTIONS     // Service types with rates (₱45, ₱65, ₱95 per kg)
MAX_WEIGHT_KG = 50
MIN_WEIGHT_KG = 0.5
```

---

## 7. UI Patterns & Design System

### Styling Approach
- **Tailwind CSS** (utility-first)
- **Color Scheme**:
  - Primary: `brand-*` (custom brand color)
  - Neutral: `slate-*` (grayscale)
  - Accents: `emerald-*`, `violet-*`, `amber-*`, `spin-*`

### Component Patterns
- **Floating Labels**: Input fields with animated labels on focus
- **Gradient Accents**: Color bars above card sections
- **Responsive**: Desktop sidebar + mobile bottom tab bar
- **Section-Based Navigation**: Tabbed portal layout
- **Modal System**: Inline modals for order details

### Icon Usage
- Emoji icons in navigation (📊 📋 💰 🧴)
- SVG icons for actions (strokes, rounded)
- Material-style design principles

---

## 8. Development Patterns

### Error Handling
- Try-catch in async operations
- Fallback to default state in dev mode
- Error messages from API or generic fallbacks

### Data Fetching
- `useCallback` for fetch functions
- `useEffect` with interval polling
- Promise.all for parallel requests
- Cleanup intervals on unmount

### State Sync
- Optimistic UI on status changes
- Manual refresh triggers (`onRefresh`)
- Periodic polling (8-10s intervals)
- Dev mode supports testing without real data

### Security Checks (Frontend)
- RoleGuard components for conditional rendering
- `canAccessRole()` checks in business logic
- Dev mode has separate fake user objects (not real accounts)

---

## Key Files for User Management Features

| Purpose | File | Type |
|---------|------|------|
| User Registration/Login | `server/app/Http/Controllers/Api/AuthController.php` | Backend |
| User Model | `server/app/Models/User.php` | Backend |
| Users Table | `database/schema.sql` | Database |
| Frontend Auth State | `client/src/context/AuthContext.tsx` | Frontend |
| Login/Register Methods | `client/src/services/api.ts` | Frontend |
| Auth Page | `client/src/pages/AuthPage.tsx` | Frontend |
| Route Guards | `client/src/routes/guards.tsx` | Frontend |
| User Types | `client/src/types/index.ts` | Frontend |

---

## Current Feature Set

✅ User registration (customer/admin roles)  
✅ Session-based login  
✅ Role-based access (customer, staff, admin)  
✅ Order management (create, update status, payment)  
✅ Dashboard analytics (admin only)  
✅ Inventory tracking  
✅ Activity logging  
✅ Dev mode for testing  
✅ reCaptcha verification  

🔲 User profile editing  
🔲 User list/management (admin)  
🔲 Bulk operations  
🔲 Advanced filtering/searching  

---

## Setup & Running

### Backend
```bash
cd server
php artisan serve
```

### Frontend
```bash
cd client
npm run dev
```

Both must be running for the app to function.

### Default Test Accounts
- **Staff**: staff@spinzone.com / (bcrypt hash)
- **Admin**: admin@spinzone.com / (bcrypt hash)

Check `database/schema.sql` for seeded password hash.
