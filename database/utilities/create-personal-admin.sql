-- Create Personal Admin Account
-- This creates a new admin account with your email

USE masterclass_lms;

-- Check if user already exists
SELECT COUNT(*) as existing_count FROM users WHERE email = 'jesrelagang94@gmail.com';

-- Insert new admin user (password: Admin123!)
-- Only inserts if email doesn't already exist
INSERT INTO users (
    name, 
    email, 
    password_hash, 
    role_id, 
    email_verified, 
    email_verified_at, 
    is_active, 
    created_at, 
    updated_at
)
SELECT 
    'Admin User',
    'jesrelagang94@gmail.com',
    '$2b$12$LQv3c1yqBwWFcXsjHrDOuef2cjq5F9F8YhfYWZ3U1N2qKW9FhQ9Hy', -- Admin123!
    3, -- Admin role
    TRUE,
    NOW(),
    TRUE,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'jesrelagang94@gmail.com'
);

-- Verify the account
SELECT id, name, email, role_id 
FROM users 
WHERE email = 'jesrelagang94@gmail.com';

SELECT 'Personal admin account ready!' as Message;
SELECT 'Email: jesrelagang94@gmail.com' as Login_Email;
SELECT 'Password: Admin123!' as Login_Password;
SELECT 'You can change the password after logging in' as Note;