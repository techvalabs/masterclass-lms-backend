-- Check what data exists in the database
-- Run this to see what's been inserted so far

-- Check users
SELECT 'Users Table:' as Info;
SELECT id, name, email, role_id FROM users ORDER BY id;

-- Check if seed users exist
SELECT 'Checking for seed users (ID 4-13):' as Info;
SELECT COUNT(*) as seed_users_count FROM users WHERE id BETWEEN 4 AND 13;

-- Check migrations table
SELECT 'Migrations Status:' as Info;
SELECT filename, success, execution_time_ms, error_message FROM migrations;

-- Check if courses exist
SELECT 'Courses:' as Info;
SELECT COUNT(*) as course_count FROM courses;

-- Check enrollments
SELECT 'Enrollments:' as Info;
SELECT COUNT(*) as enrollment_count FROM enrollments;

-- Check quizzes
SELECT 'Quizzes:' as Info;
SELECT id, course_id, title FROM quizzes;