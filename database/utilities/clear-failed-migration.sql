-- Clear failed migration attempts
-- Run this if a migration partially succeeded but recorded as failed

-- Remove the failed seed migration record so it can be retried
DELETE FROM migrations WHERE filename = '003_seed_realistic_data.sql' AND success = FALSE;

-- Check what's in the migrations table
SELECT * FROM migrations;

-- Optional: If you want to completely reset and retry the seed data
-- This will delete all data inserted by the seed migration
-- WARNING: Only run this if you want to remove all seed data!

/*
-- Clear seed data (uncomment if needed)
SET FOREIGN_KEY_CHECKS = 0;

-- Clear in reverse dependency order
DELETE FROM lesson_progress WHERE user_id > 3;
DELETE FROM quiz_attempts WHERE user_id > 3;
DELETE FROM notifications WHERE user_id > 3;
DELETE FROM activity_logs WHERE user_id > 3;
DELETE FROM certificates WHERE user_id > 3;
DELETE FROM course_reviews WHERE user_id > 3;
DELETE FROM instructor_earnings WHERE instructor_id > 1;
DELETE FROM payment_transactions WHERE user_id > 3;
DELETE FROM enrollments WHERE user_id > 3;
DELETE FROM course_lessons WHERE course_id > 0;
DELETE FROM courses WHERE id > 0;
DELETE FROM course_categories WHERE id > 0;
DELETE FROM instructors WHERE user_id > 3;
DELETE FROM users WHERE id > 3;
DELETE FROM coupons WHERE id > 0;
DELETE FROM quizzes WHERE id > 0;

-- Remove the migration record
DELETE FROM migrations WHERE filename = '003_seed_realistic_data.sql';

SET FOREIGN_KEY_CHECKS = 1;
*/