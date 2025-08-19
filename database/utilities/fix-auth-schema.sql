-- Fix Authentication Schema Compatibility
-- This script modifies the existing database to match AuthController expectations

USE masterclass_lms;

-- Disable foreign key checks for schema modifications
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Add missing columns that AuthController expects
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar VARCHAR(255) DEFAULT NULL AFTER name,
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'student' AFTER role_id;

-- 2. Update existing users to have string roles based on role_id
UPDATE users SET role = 'admin' WHERE role_id = 3;
UPDATE users SET role = 'instructor' WHERE role_id = 2;
UPDATE users SET role = 'student' WHERE role_id = 1;
UPDATE users SET role = 'moderator' WHERE role_id = 4;

-- 3. Fix boolean column compatibility 
-- email_verified_at should exist (it's in the migration) but ensure it's properly set
UPDATE users SET email_verified_at = NOW() WHERE email_verified = 1 AND email_verified_at IS NULL;

-- 4. Clear existing problematic admin user
DELETE FROM users WHERE email = 'jesrelagang94@gmail.com';

-- 5. Insert admin user compatible with AuthController expectations
-- Using integer ID (database will auto-increment) but providing all required fields
INSERT INTO users (
    email, 
    name, 
    avatar,
    password_hash, 
    role_id,
    role,
    is_active, 
    email_verified,
    email_verified_at,
    created_at, 
    updated_at
) VALUES (
    'jesrelagang94@gmail.com',
    'Admin User',
    NULL,
    '$2b$12$LQv3c1yqBwWFcXsjHrDOuef2cjq5F9F8YhfYWZ3U1N2qKW9FhQ9Hy', -- Admin123!
    3,                  -- Admin role_id for database consistency
    'admin',            -- String role for AuthController
    1,                  -- is_active = true
    1,                  -- email_verified = true  
    NOW(),              -- email_verified_at
    NOW(),              -- created_at
    NOW()               -- updated_at
);

-- 6. Create user profile entry (AuthController expects this)
INSERT INTO user_profiles (
    id,
    user_id, 
    marketing_consent, 
    created_at,
    updated_at
) VALUES (
    UUID(),
    LAST_INSERT_ID(),
    0,
    NOW(),
    NOW()
);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify the setup
SELECT 'Schema fixed successfully!' as Status;
SELECT 'User created:' as Info;
SELECT id, email, name, avatar, role, role_id, is_active, email_verified, email_verified_at
FROM users 
WHERE email = 'jesrelagang94@gmail.com';

SELECT 'Login credentials:' as Instructions;
SELECT 'Email: jesrelagang94@gmail.com' as Email;
SELECT 'Password: Admin123!' as Password;

SELECT 'Available columns in users table:' as Schema_Info;
SHOW COLUMNS FROM users;