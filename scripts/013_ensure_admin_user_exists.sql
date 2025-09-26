-- Create admin user with simple password
-- This will insert the admin user if it doesn't exist, or update if it does

INSERT INTO admin_users (id, username, password_hash, created_at)
VALUES (
  gen_random_uuid(),
  'admin',
  'admin123',
  NOW()
)
ON CONFLICT (username) 
DO UPDATE SET 
  password_hash = 'admin123',
  created_at = NOW();

-- Verify the admin user was created
SELECT username, password_hash, created_at FROM admin_users WHERE username = 'admin';
