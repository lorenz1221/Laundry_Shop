-- Spinzone Laundry Management System — Database Schema
-- Target: laundryshop_db on localhost MySQL

CREATE DATABASE IF NOT EXISTS laundryshop_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE laundryshop_db;

-- users: stores authenticated accounts (maps to /api/register & /api/login)
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(255)   NOT NULL,
  email         VARCHAR(255)   NOT NULL UNIQUE,
  password      VARCHAR(255)   NOT NULL COMMENT 'bcrypt hash via PASSWORD_BCRYPT',
  role          ENUM('customer', 'staff', 'admin') NOT NULL DEFAULT 'customer',
  phone         VARCHAR(50)    NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- orders: laundry jobs tracked through operational phases
-- status ENUM: queue | washing | drying | ready | completed
CREATE TABLE IF NOT EXISTS orders (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  customer_id       INT            NULL,
  customer_name     VARCHAR(255)   NOT NULL,
  contact_phone     VARCHAR(50)    NULL,
  address_line1     VARCHAR(255)   NULL,
  address_line2     VARCHAR(255)   NULL,
  special_notes     TEXT           NULL,
  weight_kg         DECIMAL(6,2)   NOT NULL DEFAULT 0,
  service_type      ENUM('wash-dry-fold', 'wash-dry-press', 'premium-care') NOT NULL,
  scheduled_date    DATE           NULL,
  scheduled_time    TIME           NULL,
  fulfillment_type  ENUM('dropoff', 'delivery') NOT NULL DEFAULT 'dropoff',
  status            ENUM('queue', 'washing', 'drying', 'ready', 'completed') NOT NULL DEFAULT 'queue',
  total_fee         DECIMAL(10,2)  NOT NULL DEFAULT 0,
  payment_status    ENUM('pending', 'paid') NOT NULL DEFAULT 'pending',
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- inventory: consumable stock levels (detergents, softeners, bleach)
CREATE TABLE IF NOT EXISTS inventory (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  item_name     VARCHAR(100)   NOT NULL UNIQUE,
  current_level INT            NOT NULL DEFAULT 100,
  max_level     INT            NOT NULL DEFAULT 100,
  unit          VARCHAR(20)    NOT NULL DEFAULT 'units',
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO inventory (item_name, current_level, max_level, unit) VALUES
  ('Detergent',  85, 100, 'L'),
  ('Softener',   72, 100, 'L'),
  ('Bleach',     60, 100, 'L')
ON DUPLICATE KEY UPDATE item_name = item_name;

-- activity_logs: IT-10 system activity tracker
CREATE TABLE IF NOT EXISTS activity_logs (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NULL,
  action      VARCHAR(100) NOT NULL,
  details     TEXT NULL,
  ip_address  VARCHAR(45) NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO users (name, email, password, role) VALUES
  ('Demo Staff', 'staff@spinzone.com', '$2y$10$4rZWTrS8L6yfSNwVRy81YO0JS8x9i2Y9GJs3CPC1stgAscIuESkGW', 'staff'),
  ('Demo Admin', 'admin@spinzone.com', '$2y$10$4rZWTrS8L6yfSNwVRy81YO0JS8x9i2Y9GJs3CPC1stgAscIuESkGW', 'admin')
ON DUPLICATE KEY UPDATE email = email;
