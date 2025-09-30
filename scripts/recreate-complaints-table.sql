-- Recreate the complaints table with all necessary columns
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Complaint content
    title TEXT NOT NULL,
    details TEXT NOT NULL,
    category TEXT NOT NULL,
    
    -- Priority levels
    intensity TEXT CHECK (intensity IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
    urgency TEXT CHECK (urgency IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
    
    -- Student information (nullable for anonymous complaints)
    is_anonymous BOOLEAN DEFAULT FALSE,
    student_name TEXT,
    student_id TEXT,
    student_email TEXT,
    
    -- Status tracking
    status TEXT CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')) DEFAULT 'Open',
    
    -- Additional metadata
    location TEXT,
    contact_info TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON public.complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_intensity ON public.complaints(intensity);
CREATE INDEX IF NOT EXISTS idx_complaints_urgency ON public.complaints(urgency);

-- Enable Row Level Security (RLS)
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (for the complaint form)
CREATE POLICY "Allow public insert" ON public.complaints
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Create policy to allow authenticated users (admins) to read all complaints
CREATE POLICY "Allow authenticated read" ON public.complaints
    FOR SELECT TO authenticated
    USING (true);

-- Create policy to allow authenticated users (admins) to update complaints
CREATE POLICY "Allow authenticated update" ON public.complaints
    FOR UPDATE TO authenticated
    USING (true);

-- Create policy to allow authenticated users (admins) to delete complaints
CREATE POLICY "Allow authenticated delete" ON public.complaints
    FOR DELETE TO authenticated
    USING (true);

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_complaints_updated_at
    BEFORE UPDATE ON public.complaints
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data to test the table
INSERT INTO public.complaints (
    title, 
    details, 
    category, 
    is_anonymous,
    student_name,
    student_id,
    student_email
) VALUES
