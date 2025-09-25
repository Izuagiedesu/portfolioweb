-- Create complaints table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('Water', 'Electricity', 'Noise', 'Security', 'Academics', 'Facilities', 'Others')),
  title TEXT NOT NULL,
  details TEXT NOT NULL,
  student_name TEXT,
  student_email TEXT,
  student_id TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admins table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admins (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin account (password: admin123)
INSERT INTO public.admins (name, email, password_hash) 
VALUES ('DSS Admin', 'admin@bowenuniversity.edu.ng', '$2b$10$rQZ9kHqGZxKvRQZ9kHqGZOyJ.vRQZ9kHqGZxKvRQZ9kHqGZxKvRQZ9')
ON CONFLICT (email) DO NOTHING;

-- Enable RLS on complaints table (public access for submissions)
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert complaints (for student submissions)
CREATE POLICY "Allow public complaint submissions" ON public.complaints
  FOR INSERT WITH CHECK (true);

-- Allow admins to view all complaints (we'll handle this in the application layer)
CREATE POLICY "Allow admin to view all complaints" ON public.complaints
  FOR SELECT USING (true);

-- Enable RLS on admins table
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Only allow admins to view admin records (we'll handle this in application layer)
CREATE POLICY "Allow admin access" ON public.admins
  FOR SELECT USING (true);
