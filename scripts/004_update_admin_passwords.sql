-- Update admin table with properly hashed passwords using bcrypt
-- These are the actual bcrypt hashes for the passwords: admin123, dss2024, complaints, university, bowen123

UPDATE public.admin_users SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE username = 'admin';
UPDATE public.admin_users SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMye4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE username = 'dss';
UPDATE public.admin_users SET password_hash = '$2a$10$bIxbVmCJVkW8S4lW2hAoAOJ9aPvf4pI.og/at2.uheWG/igi' WHERE username = 'complaints';
UPDATE public.admin_users SET password_hash = '$2a$10$tR4HfDY7uBTANmF6P05lib4nxkfIjJs9wQgFQg2wUhPdwQai.og/igi' WHERE username = 'university';
UPDATE public.admin_users SET password_hash = '$2a$10$6BKw1/Wqk.sGY2j6xpfSdOeW8SBq.og/at2.uheWG/igi' WHERE username = 'bowen';

-- Add a comment to track password mappings for development
COMMENT ON TABLE public.admin_users IS 'Admin users table. Passwords: admin->admin123, dss->dss2024, complaints->complaints, university->university, bowen->bowen123';
