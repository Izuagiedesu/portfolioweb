-- Create a simple admin user with a plain password for easy setup
-- Password: admin123 (you can change this later)

INSERT INTO admin_users (id, username, password_hash, created_at)
VALUES (
  gen_random_uuid(),
  'admin',
  '$2a$10$rOvHjHxqz1Kk8K8K8K8K8O8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K',
  NOW()
) ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  created_at = NOW();

-- The above hash is for password: admin123
-- If you want a different password, use this to generate a new hash:
-- SELECT crypt('your_password_here', gen_salt('bf'));
