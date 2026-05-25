# Spinzone Laundry — React + Laravel

Monorepo: **React client** + **Laravel 8 server** (same layout as FEGURO_ReactLaravel).

## Project structure

```
Laundry_Shop/
├── client/                    # React + Vite + TypeScript + Tailwind
│   └── src/
│       ├── api/               # AxiosInstance, apiHandler
│       ├── components/
│       ├── contexts/
│       ├── pages/
│       ├── routes/
│       └── services/
├── server/                    # Laravel 8 API
│   ├── app/
│   │   ├── Enums/             # UserRole
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Api/       # Auth, Order, Payment, Dashboard, Inventory
│   │   │   │   └── Admin/     # UserManagement
│   │   │   └── Middleware/    # EnsureRole, EnsureWebRole
│   │   ├── Models/            # User, Order, ActivityLog, Inventory
│   │   ├── Services/
│   │   └── Traits/            # LogsActivity
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   ├── api.php
│   │   └── web.php
│   ├── public/                # XAMPP document entry (index.php)
│   └── .env                   # DB + app config (edit to reconnect)
└── server-legacy-php/         # Old plain PHP API (archived)
```

## Where to find things (like your screenshot)

| Screenshot (Laravel) | This project |
|----------------------|--------------|
| `app/Models/User.php` | `server/app/Models/User.php` |
| `app/Models/Client.php` | `server/app/Models/Order.php` |
| `app/Models/ClientLog.php` | `server/app/Models/ActivityLog.php` |
| `database/migrations` | `server/database/migrations/` |
| `.env` (DB config) | **`server/.env`** |
| `routes/api.php` | `server/routes/api.php` |

## Setup

### 1. Database — edit `server/.env`

```env
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=laundryshop_db
DB_USERNAME=root
DB_PASSWORD=
```

Change these to reconnect to any MySQL instance.

### 2. First-time DB + tables

```powershell
.\setup-database.ps1
```

Creates the database (if missing), runs `php artisan migrate:fresh --seed`.

### 3. Laravel app key (once)

```powershell
cd server
C:\xampp\php\php.exe artisan key:generate
```

### 4. React client

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173 — Vite proxies `/api` → `http://localhost/Laundry_Shop/server/public/api`

### 5. Demo logins (password: `staff123`)

- `admin@spinzone.com` — admin  
- `staff@spinzone.com` — admin (legacy email, admin role)  

## API endpoints (Laravel)

| Method | Route |
|--------|-------|
| POST | `/api/register` |
| POST | `/api/login` |
| GET | `/api/me` |
| POST | `/api/logout` |
| GET | `/api/orders` |
| POST | `/api/orders` |
| PATCH | `/api/orders/{id}` |
| PATCH | `/api/orders/{id}/payment` |
| GET | `/api/dashboard/stats` |
| GET | `/api/inventory` |

Legacy `.php` URLs still work for compatibility.

## reCAPTCHA (login & register)

1. Create keys at [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin) (reCAPTCHA v2 “I'm not a robot”).
2. Add to **`server/.env`**:
   ```env
   RECAPTCHA_SITE_KEY=your_site_key
   RECAPTCHA_SECRET_KEY=your_secret_key
   RECAPTCHA_ENABLED=true
   ```
3. Add the same site key to **`client/.env`**:
   ```env
   VITE_RECAPTCHA_SITE_KEY=your_site_key
   ```

For local testing, the included **Google test keys** always pass verification.

## IT-10 security

- Eloquent prepared statements + `Hash::make` / `Hash::check`
- SQL injection blocking in `App\Services\SecurityService`
- `EnsureRole` / `EnsureWebRole` middleware
- `LogsActivity` trait → `activity_logs` table

## Requirements

- XAMPP PHP 8.0+ (project uses Laravel 8)
- MySQL
- Node.js for the client
