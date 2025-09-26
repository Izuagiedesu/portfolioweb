-- Fix the complaints table ID column to have proper UUID default
-- This ensures new complaints get automatic UUID generation

-- First, let's check if the default is missing and add it
ALTER TABLE complaints 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Verify the table structure
SELECT column_name, column_default, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'complaints' 
AND table_schema = 'public'
ORDER BY ordinal_position;
