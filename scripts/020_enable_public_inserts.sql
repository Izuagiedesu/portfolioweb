-- Drop all existing policies on complaints table
DROP POLICY IF EXISTS "Allow public read access" ON complaints;
DROP POLICY IF EXISTS "Allow public insert" ON complaints;
DROP POLICY IF EXISTS "Allow admin full access" ON complaints;
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON complaints;
DROP POLICY IF EXISTS "Enable read access for all users" ON complaints;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON complaints;
DROP POLICY IF EXISTS "Enable read for authenticated users only" ON complaints;

-- Ensure RLS is enabled
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows anyone to insert complaints
CREATE POLICY "Allow anyone to submit complaints"
ON complaints
FOR INSERT
TO public
WITH CHECK (true);

-- Create a policy that allows anyone to read complaints (for public viewing if needed)
CREATE POLICY "Allow anyone to read complaints"
ON complaints
FOR SELECT
TO public
USING (true);

-- Create a policy for updates (only authenticated users can update)
CREATE POLICY "Allow authenticated users to update complaints"
ON complaints
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create a policy for deletes (only authenticated users can delete)
CREATE POLICY "Allow authenticated users to delete complaints"
ON complaints
FOR DELETE
TO authenticated
USING (true);
