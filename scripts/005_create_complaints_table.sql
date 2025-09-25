-- Create complaints table for storing student complaints
CREATE TABLE IF NOT EXISTS complaints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    student_name VARCHAR(255),
    student_email VARCHAR(255),
    student_id VARCHAR(50),
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC);

-- Create an index on category for faster filtering
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);

-- Insert some sample data for testing
INSERT INTO complaints (category, title, details, student_name, student_email, student_id, is_anonymous) VALUES
('Academic Issues', 'Unfair Grading in Mathematics Course', 'The professor seems to grade inconsistently and does not provide clear rubrics for assignments.', 'John Smith', 'john.smith@university.edu', 'STU001', false),
('Facilities', 'Broken Air Conditioning in Library', 'The air conditioning system in the main library has been broken for over a week, making it difficult to study.', NULL, NULL, NULL, true),
('Administrative Services', 'Long Wait Times at Registration Office', 'Students have to wait for hours to get simple registration issues resolved.', 'Sarah Johnson', 'sarah.j@university.edu', 'STU002', false),
('Campus Safety', 'Poor Lighting in Parking Lot C', 'The lighting in parking lot C is inadequate, creating safety concerns for evening students.', NULL, NULL, NULL, true),
('Academic Issues', 'Professor Frequently Cancels Classes', 'Professor in Chemistry 101 has cancelled classes multiple times without proper notice.', 'Mike Davis', 'mike.davis@university.edu', 'STU003', false),
('Food Services', 'Limited Vegetarian Options in Cafeteria', 'The main cafeteria has very few vegetarian meal options available.', 'Lisa Chen', 'lisa.chen@university.edu', 'STU004', false),
('Technology', 'WiFi Connection Issues in Dormitories', 'Internet connection is frequently unstable in the residence halls, affecting online learning.', NULL, NULL, NULL, true),
('Financial Aid', 'Delayed Scholarship Disbursement', 'Scholarship payments are consistently late, causing financial stress for students.', 'Robert Wilson', 'robert.w@university.edu', 'STU005', false);

-- Update the updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
