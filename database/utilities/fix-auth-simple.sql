-- Simple Auth Fix - Work with existing integer schema
-- This creates an admin user compatible with the current database structure

USE masterclass_lms;

-- Add role column if it doesn't exist (ignore error if it already exists)
ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'student' AFTER role_id;

-- Update existing users to have string roles
UPDATE users SET role = 'admin' WHERE role_id = 3;
UPDATE users SET role = 'instructor' WHERE role_id = 2;
UPDATE users SET role = 'student' WHERE role_id = 1;
UPDATE users SET role = 'moderator' WHERE role_id = 4;

-- Delete existing admin user if exists
DELETE FROM users WHERE email = 'jesrelagang94@gmail.com';

-- Insert admin user with integer ID (let auto_increment handle it)
INSERT INTO users (
    name, 
    email, 
    password_hash, 
    role_id,
    role,
    is_active, 
    email_verified,
    email_verified_at,
    created_at, 
    updated_at
) VALUES (
    'Admin User',
    'jesrelagang94@gmail.com',
    '$2b$12$LQv3c1yqBwWFcXsjHrDOuef2cjq5F9F8YhfYWZ3U1N2qKW9FhQ9Hy', -- Admin123!
    3,                  -- Admin role_id
    'admin',            -- String role for AuthController
    TRUE,               -- is_active
    TRUE,               -- email_verified
    NOW(),              -- email_verified_at
    NOW(),              -- created_at
    NOW()               -- updated_at
);

-- Get the auto-generated ID
SET @admin_id = LAST_INSERT_ID();

-- Verify the admin user
SELECT 'Admin user created successfully:' as Info;
SELECT id, email, name, role, role_id, is_active, email_verified, email_verified_at
FROM users 
WHERE email = 'jesrelagang94@gmail.com';

SELECT 'Login credentials:' as Message;
SELECT 'Email: jesrelagang94@gmail.com' as Login_Email;
SELECT 'Password: Admin123!' as Login_Password;
SELECT 'User ID:' as Note, @admin_id as admin_id;