-- Update Admin Email Address
-- This script updates the admin email to your personal email

USE masterclass_lms;

-- Update the admin user email
UPDATE users 
SET 
    email = 'jesrelagang94@gmail.com',
    updated_at = NOW()
WHERE 
    id = 1 
    AND role_id = 3;

-- Verify the update
SELECT id, name, email, role_id 
FROM users 
WHERE id = 1;

-- Optional: Update system settings if needed
UPDATE system_settings 
SET setting_value = 'jesrelagang94@gmail.com' 
WHERE setting_key = 'admin_email';

SELECT 'Admin email updated successfully!' as Message;
SELECT 'New admin email: jesrelagang94@gmail.com' as Info;
SELECT 'Password remains: Admin123!' as Password_Info;