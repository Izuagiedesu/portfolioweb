-- Final admin user setup - ensure everything is working
-- Delete any existing admin user first
DELETE FROM admin_users WHERE username = 'admin';

-- Create admin user with the exact password expected by the system
INSERT INTO admin_users (id, username, password_hash, created_at)
VALUES (
  gen_random_uuid(),
  'admin',
  'admin123',
  NOW()
);

-- Verify the admin user was created correctly
SELECT 
  id,
  username, 
  password_hash, 
  created_at 
FROM admin_users 
WHERE username = 'admin';

-- Show total count to confirm
SELECT COUNT(*) as total_admin_users FROM admin_users;
