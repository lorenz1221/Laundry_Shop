-- Fix demo staff password (plain: staff123) — run via mysql client to avoid shell $ expansion
UPDATE users SET password = '$2y$10$4rZWTrS8L6yfSNwVRy81YO0JS8x9i2Y9GJs3CPC1stgAscIuESkGW' WHERE email = 'staff@spinzone.com';
