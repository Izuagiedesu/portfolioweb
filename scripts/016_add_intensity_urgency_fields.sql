-- Add intensity and urgency fields to complaints table
ALTER TABLE public.complaints 
ADD COLUMN IF NOT EXISTS intensity TEXT CHECK (intensity IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Medium',
ADD COLUMN IF NOT EXISTS urgency TEXT CHECK (urgency IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Medium';

-- Update existing complaints to have default values
UPDATE public.complaints 
SET intensity = 'Medium', urgency = 'Medium' 
WHERE intensity IS NULL OR urgency IS NULL;
