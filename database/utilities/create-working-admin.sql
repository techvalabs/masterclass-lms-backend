-- Create Working Admin Account
-- Based on Express.js authentication best practices

USE masterclass_lms;

-- First, let's check what we currently have
SELECT 'Current users table structure:' as Info;
DESCRIBE users;

-- Show current users
SELECT 'Current users:' as Info;
SELECT id, email, name, role_id, is_active, email_verified FROM users;

-- Clear and create a simple admin user that works with the existing schema
DELETE FROM users WHERE email = 'jesrelagang94@gmail.com';

-- Insert admin user with correct bcrypt hash for "password123"
INSERT INTO users (
    name, 
    email, 
    password_hash, 
    role_id,
    is_active, 
    email_verified,
    email_verified_at,
    created_at, 
    updated_at
) VALUES (
    'Admin User',
    'jesrelagang94@gmail.com',
    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- "password123"
    3,               -- Admin role_id
    1,               -- is_active = true (using 1 for tinyint)
    1,               -- email_verified = true (using 1 for tinyint)
    NOW(),           -- email_verified_at
    NOW(),           -- created_at
    NOW()            -- updated_at
);

-- Verify the user was created
SELECT 'New admin user created:' as Result;
SELECT id, email, name, role_id, is_active, email_verified, 
       LENGTH(password_hash) as password_hash_length,
       email_verified_at
FROM users 
WHERE email = 'jesrelagang94@gmail.com';

-- Also create a backup admin with "Admin123!" password
DELETE FROM users WHERE email = 'admin@backup.com';
INSERT INTO users (
    name, 
    email, 
    password_hash, 
    role_id,
    is_active, 
    email_verified,
    email_verified_at,
    created_at, 
    updated_at
) VALUES (
    'Backup Admin',
    'admin@backup.com',
    '$2b$12$LQv3c1yqBwWFcXsjHrDOuef2cjq5F9F8YhfYWZ3U1N2qKW9FhQ9Hy', -- "Admin123!"
    3,               -- Admin role_id
    1,               -- is_active = true
    1,               -- email_verified = true
    NOW(),           -- email_verified_at
    NOW(),           -- created_at
    NOW()            -- updated_at
);

SELECT 'Login options:' as Info;
SELECT 'Option 1 - Email: jesrelagang94@gmail.com, Password: password123' as Login1;
SELECT 'Option 2 - Email: admin@backup.com, Password: Admin123!' as Login2;

-- Show all admin users
SELECT 'All admin users:' as Summary;
SELECT id, email, name, role_id, is_active, email_verified 
FROM users 
WHERE role_id = 3
ORDER BY id;