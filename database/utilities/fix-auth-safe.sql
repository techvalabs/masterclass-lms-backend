-- Safe Auth Fix - Handle existing columns gracefully
USE masterclass_lms;

-- Check if role column exists, if not add it
SET @sql = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT ''student'' AFTER role_id',
        'SELECT ''Column role already exists'' as message'
    )
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'masterclass_lms' 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'role'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing users to have string roles (safe - won't error if already set)
UPDATE users SET role = 'admin' WHERE role_id = 3 AND (role IS NULL OR role = 'student');
UPDATE users SET role = 'instructor' WHERE role_id = 2 AND (role IS NULL OR role = 'student');
UPDATE users SET role = 'student' WHERE role_id = 1 AND (role IS NULL OR role = '');
UPDATE users SET role = 'moderator' WHERE role_id = 4 AND (role IS NULL OR role = 'student');

-- Delete existing user safely
DELETE FROM users WHERE email = 'jesrelagang94@gmail.com';

-- Insert new admin user
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
    3,
    'admin',
    TRUE,
    TRUE,
    NOW(),
    NOW(),
    NOW()
);

-- Show results
SELECT 'Admin user setup complete!' as Status;
SELECT id, email, name, role, role_id, is_active, email_verified 
FROM users 
WHERE email = 'jesrelagang94@gmail.com';

-- Check all users
SELECT 'All users:' as Info;
SELECT id, email, name, role, role_id FROM users ORDER BY id;