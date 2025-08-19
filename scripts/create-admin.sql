-- Script to create an admin account in the masterclass_lms database
-- Run this in MySQL to create an admin user

USE masterclass_lms;

-- First, check if roles table exists and has admin role
INSERT INTO roles (id, name, description) 
VALUES (3, 'admin', 'System Administrator')
ON DUPLICATE KEY UPDATE name='admin';

-- Create admin user (password: Admin@123)
-- The password hash below is for 'Admin@123'
INSERT INTO users (
    name, 
    email, 
    password_hash, 
    role_id, 
    email_verified, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    'System Admin',
    'admin@masterclass.com',
    '$2a$12$YourHashHere', -- This needs to be generated
    3, -- admin role_id
    1,
    1,
    NOW(),
    NOW()
);

-- To update an existing user to admin:
-- UPDATE users SET role_id = 3 WHERE email = 'your-email@example.com';