# Spinzone Laundry - Server

PHP REST API backend for the Spinzone Laundry Shop Management System.

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/login.php` | POST | User authentication |
| `/register.php` | POST | User registration |
| `/logout.php` | POST | User logout |
| `/me.php` | GET | Get current user session |
| `/orders.php` | GET/POST/PATCH | Order management |
| `/inventory.php` | GET | Inventory tracking |

## Database

The server connects to a local MySQL database named `laundryshop_db`.

### Configuration

Update `db_connect.php` with your database credentials:

```php
$host = 'localhost';
$dbname = 'laundryshop_db';
$username = 'root';
$password = '';
```

## Setup

1. Place the `server` folder in your XAMPP `htdocs` directory
2. Import the database schema from `database/schema.sql`
3. Configure `db_connect.php` with your credentials
4. Start Apache and MySQL from XAMPP

## CORS

The `cors.php` file handles Cross-Origin Resource Sharing for API requests from the React frontend.
