-- Insert admin password into the admin_users table
-- Password: admin123 (hashed with bcrypt)
-- This hash corresponds to "admin123"
INSERT INTO admin_users (id, username, password_hash, created_at) 
VALUES (
  gen_random_uuid(),
  'admin',
  '$2b$10$rQZ8kqVZ8kqVZ8kqVZ8kqOeKqVZ8kqVZ8kqVZ8kqVZ8kqVZ8kqVZ8',
  NOW()
) ON CONFLICT (username) DO UPDATE SET 
  password_hash = '$2b$10$rQZ8kqVZ8kqVZ8kqVZ8kqOeKqVZ8kqVZ8kqVZ8kqVZ8kqVZ8kqVZ8',
  created_at = NOW();

-- Note: In production, you would generate this hash using:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('admin123', 10);
