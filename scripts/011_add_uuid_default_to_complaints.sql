-- Fix the complaints table to auto-generate UUIDs for the id column
-- This will resolve the "null value in column id" error

ALTER TABLE complaints 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Verify the change
SELECT column_name, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'complaints' AND column_name = 'id';
