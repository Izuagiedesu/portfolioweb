-- Delete any existing admin user first
DELETE FROM admin_users WHERE username = 'admin';

-- Create admin user with simple password matching exactly what the UI shows
INSERT INTO admin_users (id, username, password_hash, created_at)
VALUES (
  gen_random_uuid(),
  'admin',
  'admin123',
  NOW()
);

-- Verify the admin user was created correctly
SELECT username, password_hash, created_at FROM admin_users WHERE username = 'admin';
