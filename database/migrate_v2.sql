-- Migration v2: completed status + order detail columns
USE laundryshop_db;

ALTER TABLE users ADD COLUMN phone VARCHAR(50) NULL AFTER role;

ALTER TABLE orders
  ADD COLUMN contact_phone VARCHAR(50) NULL AFTER customer_name,
  ADD COLUMN address_line1 VARCHAR(255) NULL AFTER contact_phone,
  ADD COLUMN address_line2 VARCHAR(255) NULL AFTER address_line1,
  ADD COLUMN special_notes TEXT NULL AFTER address_line2;

ALTER TABLE orders MODIFY COLUMN status
  ENUM('queue', 'washing', 'drying', 'ready', 'completed') NOT NULL DEFAULT 'queue';
