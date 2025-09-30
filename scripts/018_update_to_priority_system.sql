-- Update complaints table to use priority system instead of intensity/urgency
-- Add new priority column
ALTER TABLE public.complaints 
ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Medium';

-- Add location fields
ALTER TABLE public.complaints 
ADD COLUMN IF NOT EXISTS hostel TEXT,
ADD COLUMN IF NOT EXISTS room_department TEXT;

-- Migrate existing data: combine intensity and urgency into priority
-- If either is Critical, set priority to Critical
-- If either is High, set priority to High
-- If both are Medium, set priority to Medium
-- If both are Low, set priority to Low
UPDATE public.complaints
SET priority = CASE
    WHEN intensity = 'Critical' OR urgency = 'Critical' THEN 'Critical'
    WHEN intensity = 'High' OR urgency = 'High' THEN 'High'
    WHEN intensity = 'Medium' OR urgency = 'Medium' THEN 'Medium'
    ELSE 'Low'
END
WHERE priority IS NULL;

-- Create index for priority
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON public.complaints(priority);

-- Drop old indexes for intensity and urgency
DROP INDEX IF EXISTS idx_complaints_intensity;
DROP INDEX IF EXISTS idx_complaints_urgency;

-- Note: We're keeping intensity and urgency columns for now to avoid data loss
-- They can be dropped later after confirming the migration is successful
-- To drop them, uncomment the following lines:
-- ALTER TABLE public.complaints DROP COLUMN IF EXISTS intensity;
-- ALTER TABLE public.complaints DROP COLUMN IF EXISTS urgency;
