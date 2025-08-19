-- Reset and Seed Script
-- This script will clear existing seed data and re-insert everything
-- Run this if migrations are failing

USE masterclass_lms;

-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Clear all data except the admin user and initial settings
DELETE FROM activity_logs WHERE id > 1;
DELETE FROM notifications;
DELETE FROM certificates;
DELETE FROM quiz_attempts;
DELETE FROM quizzes;
DELETE FROM lesson_progress;
DELETE FROM course_reviews;
DELETE FROM instructor_earnings;
DELETE FROM payment_transactions;
DELETE FROM enrollments;
DELETE FROM course_lessons;
DELETE FROM courses;
DELETE FROM course_categories;
DELETE FROM coupons;
DELETE FROM instructors;
DELETE FROM users WHERE id > 3;  -- Keep admin and initial users

-- Clear migration record for seed data
DELETE FROM migrations WHERE filename = '003_seed_realistic_data.sql';

-- Now insert the seed data
-- First, insert users (students)
INSERT INTO users (id, name, email, password_hash, role_id, email_verified, email_verified_at, is_active, bio, location, phone, avatar, created_at, updated_at) VALUES
(4, 'Michael Thompson', 'michael.thompson@gmail.com', '$2b$12$9R6k8UG0o.Ys7XnLzZeW9P1H2sC4tR5Y6gI8jL9mN0kO1pQ3rS2vX', 1, TRUE, DATE_SUB(NOW(), INTERVAL 5 DAY), TRUE, 'Former software engineer transitioning into real estate investment.', 'Austin, TX', '+1-512-555-0123', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),
(5, 'Jennifer Davis', 'jennifer.davis@outlook.com', '$2b$12$9R6k8UG0o.Ys7XnLzZeW9P1H2sC4tR5Y6gI8jL9mN0kO1pQ3rS2vX', 1, TRUE, DATE_SUB(NOW(), INTERVAL 8 DAY), TRUE, 'Marketing professional looking to diversify income through real estate.', 'Denver, CO', '+1-303-555-0456', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150', DATE_SUB(NOW(), INTERVAL 18 DAY), NOW()),
(6, 'David Rodriguez', 'david.rodriguez@yahoo.com', '$2b$12$9R6k8UG0o.Ys7XnLzZeW9P1H2sC4tR5Y6gI8jL9mN0kO1pQ3rS2vX', 1, TRUE, DATE_SUB(NOW(), INTERVAL 3 DAY), TRUE, 'Recent college graduate interested in real estate wholesaling.', 'Phoenix, AZ', '+1-602-555-0789', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
(7, 'Emily Wilson', 'emily.wilson@gmail.com', '$2b$12$9R6k8UG0o.Ys7XnLzZeW9P1H2sC4tR5Y6gI8jL9mN0kO1pQ3rS2vX', 1, TRUE, DATE_SUB(NOW(), INTERVAL 15 DAY), TRUE, 'Nurse practitioner seeking passive income through real estate.', 'Seattle, WA', '+1-206-555-0321', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', DATE_SUB(NOW(), INTERVAL 25 DAY), NOW()),
(8, 'James Anderson', 'james.anderson@icloud.com', '$2b$12$9R6k8UG0o.Ys7XnLzZeW9P1H2sC4tR5Y6gI8jL9mN0kO1pQ3rS2vX', 1, TRUE, DATE_SUB(NOW(), INTERVAL 1 DAY), TRUE, 'Retired teacher with savings to invest.', 'Tampa, FL', '+1-813-555-0654', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150', DATE_SUB(NOW(), INTERVAL 6 DAY), NOW()),
(9, 'Lisa Chen', 'lisa.chen@gmail.com', '$2b$12$9R6k8UG0o.Ys7XnLzZeW9P1H2sC4tR5Y6gI8jL9mN0kO1pQ3rS2vX', 1, TRUE, DATE_SUB(NOW(), INTERVAL 4 DAY), TRUE, 'Financial advisor understanding real estate investment.', 'San Francisco, CA', '+1-415-555-0987', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', DATE_SUB(NOW(), INTERVAL 14 DAY), NOW()),
(10, 'Robert Brown', 'robert.brown@gmail.com', '$2b$12$9R6k8UG0o.Ys7XnLzZeW9P1H2sC4tR5Y6gI8jL9mN0kO1pQ3rS2vX', 1, TRUE, DATE_SUB(NOW(), INTERVAL 7 DAY), TRUE, 'Small business owner interested in commercial real estate.', 'Chicago, IL', '+1-312-555-0147', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', DATE_SUB(NOW(), INTERVAL 21 DAY), NOW()),
(11, 'Amanda Taylor', 'amanda.taylor@hotmail.com', '$2b$12$9R6k8UG0o.Ys7XnLzZeW9P1H2sC4tR5Y6gI8jL9mN0kO1pQ3rS2vX', 1, FALSE, NULL, TRUE, 'Recent MBA graduate applying finance to real estate.', 'Boston, MA', '+1-617-555-0258', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(12, 'Kevin Martinez', 'kevin.martinez@gmail.com', '$2b$12$9R6k8UG0o.Ys7XnLzZeW9P1H2sC4tR5Y6gI8jL9mN0kO1pQ3rS2vX', 1, TRUE, DATE_SUB(NOW(), INTERVAL 6 DAY), TRUE, 'Construction worker learning real estate business.', 'Las Vegas, NV', '+1-702-555-0369', 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150', DATE_SUB(NOW(), INTERVAL 16 DAY), NOW()),
(13, 'Nicole Johnson', 'nicole.johnson@yahoo.com', '$2b$12$9R6k8UG0o.Ys7XnLzZeW9P1H2sC4tR5Y6gI8jL9mN0kO1pQ3rS2vX', 1, TRUE, DATE_SUB(NOW(), INTERVAL 9 DAY), TRUE, 'Real estate agent transitioning to investment.', 'Miami, FL', '+1-305-555-0741', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', DATE_SUB(NOW(), INTERVAL 11 DAY), NOW());

-- Insert instructor users  
INSERT INTO users (id, name, email, password_hash, role_id, email_verified, email_verified_at, is_active, bio, location, phone, website, avatar, created_at, updated_at) VALUES
(14, 'Dr. Patricia Williams', 'patricia.williams@realestate-pro.com', '$2b$12$8Q5i7TF9n.Xr6WmKzYdV8OoGhQlB2rT3H4YF7hN9vK1L3pQ5mE2nW', 2, TRUE, DATE_SUB(NOW(), INTERVAL 45 DAY), TRUE, 'PhD in Economics with 20+ years in commercial real estate.', 'Atlanta, GA', '+1-404-555-0182', 'https://patriciawilliams-re.com', 'https://images.unsplash.com/photo-1559586367-4c347d7dd3d6?w=150', DATE_SUB(NOW(), INTERVAL 90 DAY), NOW()),
(15, 'Mark Thompson', 'mark.thompson@flipmaster.com', '$2b$12$8Q5i7TF9n.Xr6WmKzYdV8OoGhQlB2rT3H4YF7hN9vK1L3pQ5mE2nW', 2, TRUE, DATE_SUB(NOW(), INTERVAL 30 DAY), TRUE, 'Professional house flipper with 300+ successful projects.', 'Orlando, FL', '+1-407-555-0293', 'https://flipmaster-academy.com', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', DATE_SUB(NOW(), INTERVAL 60 DAY), NOW()),
(16, 'Sarah Mitchell', 'sarah.mitchell@propertywealth.com', '$2b$12$8Q5i7TF9n.Xr6WmKzYdV8OoGhQlB2rT3H4YF7hN9vK1L3pQ5mE2nW', 2, TRUE, DATE_SUB(NOW(), INTERVAL 20 DAY), TRUE, 'Former Wall Street analyst turned real estate mogul.', 'Dallas, TX', '+1-214-555-0504', 'https://propertywealth.com', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', DATE_SUB(NOW(), INTERVAL 75 DAY), NOW());

-- Course Categories
INSERT INTO course_categories (id, name, description, slug, icon, is_active, created_at, updated_at) VALUES
(1, 'Real Estate Fundamentals', 'Basic concepts and principles of real estate investing', 'real-estate-fundamentals', 'graduation-cap', TRUE, DATE_SUB(NOW(), INTERVAL 90 DAY), NOW()),
(2, 'Property Analysis', 'Learn to analyze properties for investment potential', 'property-analysis', 'chart-line', TRUE, DATE_SUB(NOW(), INTERVAL 85 DAY), NOW()),
(3, 'Fix and Flip', 'House flipping strategies and renovation management', 'fix-and-flip', 'hammer', TRUE, DATE_SUB(NOW(), INTERVAL 80 DAY), NOW()),
(4, 'Rental Properties', 'Buy and hold strategies for rental income', 'rental-properties', 'home', TRUE, DATE_SUB(NOW(), INTERVAL 75 DAY), NOW()),
(5, 'Commercial Real Estate', 'Commercial property investment and management', 'commercial-real-estate', 'building', TRUE, DATE_SUB(NOW(), INTERVAL 70 DAY), NOW()),
(6, 'Real Estate Finance', 'Financing strategies and investment mathematics', 'real-estate-finance', 'calculator', TRUE, DATE_SUB(NOW(), INTERVAL 65 DAY), NOW()),
(7, 'Wholesaling', 'Real estate wholesaling and contract assignment', 'wholesaling', 'handshake', TRUE, DATE_SUB(NOW(), INTERVAL 60 DAY), NOW()),
(8, 'Property Management', 'Managing rental properties and tenant relations', 'property-management', 'users', TRUE, DATE_SUB(NOW(), INTERVAL 55 DAY), NOW());

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify the data was inserted
SELECT 'Data inserted successfully!' as Message;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as category_count FROM course_categories;