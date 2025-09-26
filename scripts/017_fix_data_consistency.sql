-- Fix any data consistency issues with intensity and urgency fields
-- Ensure all existing complaints have proper intensity and urgency values

-- First, check if columns exist and add them if they don't
DO $$ 
BEGIN
    -- Add intensity column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'complaints' AND column_name = 'intensity') THEN
        ALTER TABLE public.complaints 
        ADD COLUMN intensity TEXT CHECK (intensity IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Medium';
    END IF;
    
    -- Add urgency column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'complaints' AND column_name = 'urgency') THEN
        ALTER TABLE public.complaints 
        ADD COLUMN urgency TEXT CHECK (urgency IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Medium';
    END IF;
END $$;

-- Update any NULL or invalid values to default 'Medium'
UPDATE public.complaints 
SET intensity = 'Medium' 
WHERE intensity IS NULL OR intensity NOT IN ('Low', 'Medium', 'High', 'Critical');

UPDATE public.complaints 
SET urgency = 'Medium' 
WHERE urgency IS NULL OR urgency NOT IN ('Low', 'Medium', 'High', 'Critical');

-- Verify the data
SELECT 
    COUNT(*) as total_complaints,
    COUNT(CASE WHEN intensity IS NOT NULL THEN 1 END) as complaints_with_intensity,
    COUNT(CASE WHEN urgency IS NOT NULL THEN 1 END) as complaints_with_urgency
FROM public.complaints;
