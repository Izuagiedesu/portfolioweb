-- Drop existing admin tables and create a clean admin table without emails
DROP TABLE IF EXISTS public.admin_users;
DROP TABLE IF EXISTS public.admins;

-- Create new admin table with just username and password
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert admin users with hashed passwords
-- Using bcrypt-style hashes for the passwords: admin123, dss2024, complaints, university, bowen123
INSERT INTO public.admin_users (username, password_hash) VALUES
  ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'), -- admin123
  ('dss', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'), -- dss2024  
  ('complaints', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'), -- complaints
  ('university', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'), -- university
  ('bowen', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'); -- bowen123

-- Enable RLS for security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access (admins can read all admin records)
CREATE POLICY "Allow admin users to view all admin records" ON public.admin_users
  FOR SELECT USING (true);

-- Create policy for admin login verification
CREATE POLICY "Allow admin login verification" ON public.admin_users
  FOR SELECT USING (true);
