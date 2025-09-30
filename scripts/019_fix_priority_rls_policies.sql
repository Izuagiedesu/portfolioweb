-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Allow public insert" ON public.complaints;
DROP POLICY IF EXISTS "Allow authenticated read" ON public.complaints;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.complaints;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.complaints;

-- Drop old indexes for intensity and urgency
DROP INDEX IF EXISTS idx_complaints_intensity;
DROP INDEX IF EXISTS idx_complaints_urgency;

-- Remove old intensity and urgency columns completely
ALTER TABLE public.complaints DROP COLUMN IF EXISTS intensity;
ALTER TABLE public.complaints DROP COLUMN IF EXISTS urgency;

-- Ensure priority column exists and has no restrictive constraints
ALTER TABLE public.complaints 
  ALTER COLUMN priority DROP NOT NULL,
  ALTER COLUMN priority DROP DEFAULT;

-- Drop any existing check constraint on priority
ALTER TABLE public.complaints DROP CONSTRAINT IF EXISTS complaints_priority_check;

-- Create new index for priority
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON public.complaints(priority);

-- Recreate RLS policies with proper permissions
CREATE POLICY "Allow public insert" ON public.complaints
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated read" ON public.complaints
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated update" ON public.complaints
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated delete" ON public.complaints
    FOR DELETE TO authenticated
    USING (true);
