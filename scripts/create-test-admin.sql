-- Create a test admin user with known credentials
-- Email: admin@university.edu
-- Password: admin123

INSERT INTO admins (name, email, password_hash) 
VALUES (
  'Test Admin', 
  'admin@university.edu', 
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
);

-- This hash corresponds to the password "admin123"
-- You can log in with:
-- Email: admin@university.edu  
-- Password: admin123
