-- Create Fresh Admin Account
-- This creates a clean admin account with a simple password

USE masterclass_lms;

-- Delete existing account if it exists
DELETE FROM users WHERE email = 'jesrelagang94@gmail.com';

-- Insert fresh admin account (password: password123)
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
) VALUES (
    'Admin User',
    'jesrelagang94@gmail.com',
    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password123
    3, -- Admin role
    TRUE,
    NOW(),
    TRUE,
    NOW(),
    NOW()
);

-- Verify the account
SELECT 'New admin account created:' as Info;
SELECT id, name, email, role_id, is_active, email_verified
FROM users 
WHERE email = 'jesrelagang94@gmail.com';

SELECT 'Login credentials:' as Message;
SELECT 'Email: jesrelagang94@gmail.com' as Login_Email;
SELECT 'Password: password123' as Login_Password;
SELECT 'You can change this password after logging in' as Note;