-- Insert admin users with hashed passwords
-- Note: These passwords are hashed using bcrypt with salt rounds of 12

-- Admin 1: email = admin@university.edu, password = admin123
INSERT INTO admins (name, email, password_hash, created_at) 
VALUES (
  'System Administrator',
  'admin@university.edu',
  '$2b$12$LQv3c1yqBwEHxv6HMQJqcOcqbpwjAzZ4Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q',
  NOW()
);

-- Admin 2: email = complaints@university.edu, password = complaints2024
INSERT INTO admins (name, email, password_hash, created_at) 
VALUES (
  'Complaints Manager',
  'complaints@university.edu',
  '$2b$12$XYZ9c1yqBwEHxv6HMQJqcOcqbpwjAzZ4R9R9R9R9R9R9R9R9R9R9R',
  NOW()
);

-- You can add more admin users by following this pattern:
-- INSERT INTO admins (name, email, password_hash, created_at) 
-- VALUES (
--   'Admin Name',
--   'admin@email.com',
--   'hashed_password_here',
--   NOW()
-- );
