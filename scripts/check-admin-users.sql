-- Check if admin users exist in the database
SELECT id, name, email, created_at 
FROM admins 
ORDER BY created_at DESC;

-- If no users exist, you can insert a test admin:
-- INSERT INTO admins (name, email, password_hash) 
-- VALUES ('Test Admin', 'admin@test.com', '$2a$10$example_hash_here');
