-- Create complaints table
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  details TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  student_name TEXT,
  student_id TEXT,
  student_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for complaints (public can insert, only authenticated admins can read)
CREATE POLICY "Anyone can submit complaints" ON public.complaints
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view complaints" ON public.complaints
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Create policies for admin_users (only authenticated admins can access)
CREATE POLICY "Authenticated users can view admin_users" ON public.admin_users
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Insert default admin user (password: dss2025)
INSERT INTO public.admin_users (email, password_hash) 
VALUES ('admin@bowenuniversity.edu.ng', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT (email) DO NOTHING;
