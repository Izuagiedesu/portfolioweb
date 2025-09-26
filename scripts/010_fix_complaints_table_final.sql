-- Fix the complaints table to have proper UUID generation
-- This ensures the ID column gets a value automatically

-- First, add the default constraint to the existing id column
ALTER TABLE complaints 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Verify the table structure
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'complaints' 
ORDER BY ordinal_position;
