-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert feedback (public submissions)
CREATE POLICY "allow_public_insert_feedback"
  ON public.feedback
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to view feedback (public display)
CREATE POLICY "allow_public_select_feedback"
  ON public.feedback
  FOR SELECT
  USING (true);

-- Only admins can update feedback (we'll add admin check later if needed)
CREATE POLICY "allow_admin_update_feedback"
  ON public.feedback
  FOR UPDATE
  USING (false);

-- Only admins can delete feedback
CREATE POLICY "allow_admin_delete_feedback"
  ON public.feedback
  FOR DELETE
  USING (false);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);
