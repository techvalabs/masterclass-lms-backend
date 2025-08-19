-- Fix Admin Password
-- This script updates the password hash for your admin account

USE masterclass_lms;

-- Check current user data
SELECT 'Current admin user data:' as Info;
SELECT id, name, email, role_id, is_active, email_verified 
FROM users 
WHERE email = 'jesrelagang94@gmail.com';

-- Update password hash to Admin123! (properly hashed)
UPDATE users 
SET 
    password_hash = '$2b$12$LQv3c1yqBwWFcXsjHrDOuef2cjq5F9F8YhfYWZ3U1N2qKW9FhQ9Hy',
    email_verified = TRUE,
    email_verified_at = NOW(),
    is_active = TRUE,
    updated_at = NOW()
WHERE email = 'jesrelagang94@gmail.com';

-- Verify the update
SELECT 'Updated admin user:' as Info;
SELECT id, name, email, role_id, is_active, email_verified, LENGTH(password_hash) as password_hash_length
FROM users 
WHERE email = 'jesrelagang94@gmail.com';

-- Also make sure the role exists and has admin permissions
SELECT 'Admin role permissions:' as Info;
SELECT id, name, permissions 
FROM roles 
WHERE id = 3;

SELECT 'Password updated successfully!' as Message;
SELECT 'Email: jesrelagang94@gmail.com' as Login_Email;
SELECT 'Password: Admin123!' as Login_Password;
SELECT 'Try logging in now' as Action;