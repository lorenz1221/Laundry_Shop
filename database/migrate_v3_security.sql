-- Migration v3: admin role + activity_logs (IT-10)
USE laundryshop_db;

ALTER TABLE users MODIFY COLUMN role
  ENUM('customer', 'staff', 'admin') NOT NULL DEFAULT 'customer';

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
  ('Demo Admin', 'admin@spinzone.com', '$2y$10$4rZWTrS8L6yfSNwVRy81YO0JS8x9i2Y9GJs3CPC1stgAscIuESkGW', 'admin')
ON DUPLICATE KEY UPDATE email = email;
