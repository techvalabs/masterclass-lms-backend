-- Fix Authentication Compatibility
-- Update the database schema to work with the existing AuthController

USE masterclass_lms;

-- First, check what columns exist in the users table
DESCRIBE users;

-- Add missing columns that AuthController expects
-- Add role column if it doesn't exist
ALTER TABLE users 
ADD COLUMN role VARCHAR(50) DEFAULT 'student' AFTER role_id;

-- Update existing users to have string roles based on role_id
UPDATE users SET role = 'admin' WHERE role_id = 3;
UPDATE users SET role = 'instructor' WHERE role_id = 2;
UPDATE users SET role = 'student' WHERE role_id = 1;
UPDATE users SET role = 'moderator' WHERE role_id = 4;

-- Create/update your admin user with UUID and correct schema
-- First delete existing user if exists
DELETE FROM users WHERE email = 'jesrelagang94@gmail.com';

-- Insert admin user with UUID and correct structure for AuthController
INSERT INTO users (
    id,                  -- UUID format
    email, 
    name, 
    password_hash, 
    role,               -- String role, not role_id
    role_id,            -- Keep for compatibility with other parts
    is_active, 
    email_verified,
    email_verified_at,
    created_at, 
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',  -- UUID format
    'jesrelagang94@gmail.com',
    'Admin User',
    '$2b$12$LQv3c1yqBwWFcXsjHrDOuef2cjq5F9F8YhfYWZ3U1N2qKW9FhQ9Hy', -- Admin123!
    'admin',            -- String role
    3,                  -- Admin role_id
    TRUE,               -- is_active
    TRUE,               -- email_verified
    NOW(),              -- email_verified_at
    NOW(),              -- created_at
    NOW()               -- updated_at
);

-- Verify the admin user
SELECT 'Admin user created with AuthController compatibility:' as Info;
SELECT id, email, name, role, role_id, is_active, email_verified, email_verified_at
FROM users 
WHERE email = 'jesrelagang94@gmail.com';

SELECT 'Login credentials:' as Message;
SELECT 'Email: jesrelagang94@gmail.com' as Login_Email;
SELECT 'Password: Admin123!' as Login_Password;
SELECT 'Now compatible with AuthController' as Status;