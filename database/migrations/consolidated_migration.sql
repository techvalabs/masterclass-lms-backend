-- ===========================================
-- Masterclass LMS Database - Consolidated Migration
-- Version: 2.0
-- Date: 2025-08-16
-- ===========================================

-- Disable foreign key checks for clean setup
SET FOREIGN_KEY_CHECKS = 0;

-- ===========================================
-- DROP EXISTING TABLES
-- ===========================================

DROP TABLE IF EXISTS quiz_attempts;
DROP TABLE IF EXISTS quiz_questions;
DROP TABLE IF EXISTS quizzes;
DROP TABLE IF EXISTS assignment_submissions;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS lesson_progress;
DROP TABLE IF EXISTS course_lessons;
DROP TABLE IF EXISTS lessons;
DROP TABLE IF EXISTS course_modules;
DROP TABLE IF EXISTS certificates;
DROP TABLE IF EXISTS course_reviews;
DROP TABLE IF EXISTS coupon_usage;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS refunds;
DROP TABLE IF EXISTS payment_transactions;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS file_uploads;
DROP TABLE IF EXISTS instructor_earnings;
DROP TABLE IF EXISTS course_categories;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS instructors;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS password_resets;
DROP TABLE IF EXISTS email_verifications;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS system_settings;

-- ===========================================
-- SYSTEM TABLES
-- ===========================================

-- System Settings
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(255) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key),
    INDEX idx_is_public (is_public)
);

-- ===========================================
-- USER MANAGEMENT TABLES
-- ===========================================

-- Roles
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_is_active (is_active)
);

-- Users
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    avatar VARCHAR(500),
    phone VARCHAR(20),
    bio TEXT,
    location VARCHAR(255),
    website VARCHAR(500),
    social_links JSON,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    INDEX idx_email (email),
    INDEX idx_role_id (role_id),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
);

-- Instructors
CREATE TABLE instructors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    expertise VARCHAR(500),
    experience_years INT DEFAULT 0,
    qualification TEXT,
    teaching_areas JSON,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_students INT DEFAULT 0,
    total_courses INT DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    bio TEXT,
    linkedin_url VARCHAR(500),
    twitter_url VARCHAR(500),
    website_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP NULL,
    commission_rate DECIMAL(5,2) DEFAULT 30.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_rating (rating),
    INDEX idx_is_verified (is_verified)
);

-- ===========================================
-- COURSE MANAGEMENT TABLES
-- ===========================================

-- Course Categories
CREATE TABLE course_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    parent_id INT NULL,
    icon VARCHAR(100),
    color VARCHAR(7),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES course_categories(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_parent_id (parent_id),
    INDEX idx_is_active (is_active),
    INDEX idx_display_order (display_order)
);

-- Courses
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    short_description VARCHAR(500),
    instructor_id INT NOT NULL,
    category_id INT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_price DECIMAL(10,2),
    thumbnail VARCHAR(500),
    preview_video VARCHAR(500),
    duration_hours INT DEFAULT 0,
    difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    language VARCHAR(50) DEFAULT 'English',
    requirements TEXT,
    objectives JSON,
    target_audience TEXT,
    enrollment_count INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES course_categories(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_instructor_id (instructor_id),
    INDEX idx_category_id (category_id),
    INDEX idx_is_published (is_published),
    INDEX idx_is_featured (is_featured),
    INDEX idx_price (price),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at)
);

-- Course Lessons
CREATE TABLE course_lessons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(500),
    video_duration INT DEFAULT 0,
    content TEXT,
    resources JSON,
    display_order INT DEFAULT 0,
    is_preview BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_course_id (course_id),
    INDEX idx_display_order (display_order),
    INDEX idx_is_published (is_published)
);

-- ===========================================
-- LEARNING MANAGEMENT TABLES
-- ===========================================

-- Enrollments
CREATE TABLE enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_date TIMESTAMP NULL,
    progress DECIMAL(5,2) DEFAULT 0.00,
    status ENUM('active', 'completed', 'cancelled', 'expired') DEFAULT 'active',
    payment_status ENUM('paid', 'pending', 'refunded') DEFAULT 'paid',
    certificate_issued BOOLEAN DEFAULT FALSE,
    certificate_issued_at TIMESTAMP NULL,
    last_accessed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (user_id, course_id),
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_status (status),
    INDEX idx_enrollment_date (enrollment_date)
);

-- Lesson Progress
CREATE TABLE lesson_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    lesson_id INT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    watch_time INT DEFAULT 0,
    completed_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE,
    UNIQUE KEY unique_progress (user_id, lesson_id),
    INDEX idx_user_course (user_id, course_id),
    INDEX idx_is_completed (is_completed)
);

-- ===========================================
-- ASSESSMENT TABLES
-- ===========================================

-- Quizzes
CREATE TABLE quizzes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    lesson_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    questions JSON NOT NULL,
    passing_score DECIMAL(5,2) DEFAULT 70.00,
    time_limit INT,
    max_attempts INT DEFAULT 3,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE,
    INDEX idx_course_id (course_id),
    INDEX idx_lesson_id (lesson_id)
);

-- Quiz Attempts
CREATE TABLE quiz_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quiz_id INT NOT NULL,
    user_id INT NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    answers JSON,
    is_passed BOOLEAN DEFAULT FALSE,
    time_taken INT,
    attempt_number INT DEFAULT 1,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_quiz_user (quiz_id, user_id),
    INDEX idx_is_passed (is_passed)
);

-- ===========================================
-- REVIEW AND RATING TABLES
-- ===========================================

-- Course Reviews
CREATE TABLE course_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    is_verified_purchase BOOLEAN DEFAULT TRUE,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_review (course_id, user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_user_id (user_id),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at)
);

-- ===========================================
-- PAYMENT AND COMMERCE TABLES
-- ===========================================

-- Payment Transactions
CREATE TABLE payment_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    final_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50),
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(255) UNIQUE,
    payment_gateway VARCHAR(50),
    gateway_response JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_created_at (created_at)
);

-- Coupons
CREATE TABLE coupons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    discount_type ENUM('percentage', 'fixed') DEFAULT 'percentage',
    discount_value DECIMAL(10,2) NOT NULL,
    max_uses INT,
    used_count INT DEFAULT 0,
    valid_from TIMESTAMP NULL,
    valid_until TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_is_active (is_active),
    INDEX idx_valid_dates (valid_from, valid_until)
);

-- Instructor Earnings
CREATE TABLE instructor_earnings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    instructor_id INT NOT NULL,
    transaction_id INT NOT NULL,
    course_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    earnings DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    paid_at TIMESTAMP NULL,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_instructor_id (instructor_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- ===========================================
-- CERTIFICATE TABLES
-- ===========================================

-- Certificates
CREATE TABLE certificates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    certificate_number VARCHAR(50) NOT NULL UNIQUE,
    issued_date DATE NOT NULL,
    certificate_url VARCHAR(500),
    verification_code VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_certificate (user_id, course_id),
    INDEX idx_certificate_number (certificate_number),
    INDEX idx_verification_code (verification_code)
);

-- ===========================================
-- NOTIFICATION TABLES
-- ===========================================

-- Notifications
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSON,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- ===========================================
-- ACTIVITY LOG TABLES
-- ===========================================

-- Activity Logs
CREATE TABLE activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at)
);

-- ===========================================
-- INITIAL DATA SEEDING
-- ===========================================

-- Insert Roles
INSERT INTO roles (name, description, permissions) VALUES
('student', 'Regular student user', '["view_courses", "enroll_courses", "view_certificates"]'),
('instructor', 'Course instructor', '["create_courses", "edit_own_courses", "view_earnings", "view_students"]'),
('admin', 'System administrator', '["all"]'),
('moderator', 'Content moderator', '["moderate_content", "manage_reviews", "manage_users"]');

-- Insert System Settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('site_name', 'Masterclass LMS', 'string', 'Site name', TRUE),
('site_url', 'http://localhost:5173', 'string', 'Site URL', TRUE),
('support_email', 'support@masterclass-lms.com', 'string', 'Support email', TRUE),
('currency', 'USD', 'string', 'Default currency', TRUE),
('commission_rate', '30', 'number', 'Default instructor commission rate', FALSE),
('allow_registration', 'true', 'boolean', 'Allow new user registration', TRUE),
('require_email_verification', 'false', 'boolean', 'Require email verification', FALSE),
('maintenance_mode', 'false', 'boolean', 'Maintenance mode', FALSE);

-- Insert Admin User
INSERT INTO users (name, email, password_hash, role_id, is_active, email_verified, email_verified_at) VALUES
('System Administrator', 'jesrelagang94@gmail.com', '$2a$12$JGqZe6TKeAqcRAaOzHlFju3a6lQqPF5GvOCwY9UWnRSGJJGzYXsYy', 3, 1, 1, NOW());

-- Insert Sample Instructor User
INSERT INTO users (name, email, password_hash, role_id, is_active, email_verified, email_verified_at) VALUES
('John Instructor', 'instructor@example.com', '$2a$12$JGqZe6TKeAqcRAaOzHlFju3a6lQqPF5GvOCwY9UWnRSGJJGzYXsYy', 2, 1, 1, NOW());

-- Add instructor profile
INSERT INTO instructors (user_id, expertise, experience_years, qualification, is_verified, verified_at) VALUES
(2, 'Real Estate Investment, Property Management', 10, 'MBA in Real Estate, Certified Property Manager', 1, NOW());

-- Insert Sample Student User
INSERT INTO users (name, email, password_hash, role_id, is_active, email_verified, email_verified_at) VALUES
('Jane Student', 'student@example.com', '$2a$12$JGqZe6TKeAqcRAaOzHlFju3a6lQqPF5GvOCwY9UWnRSGJJGzYXsYy', 1, 1, 1, NOW());

-- Insert Course Categories
INSERT INTO course_categories (name, slug, description, icon, is_active, display_order) VALUES
('Real Estate Basics', 'real-estate-basics', 'Fundamental concepts in real estate', 'home', 1, 1),
('Investment Strategies', 'investment-strategies', 'Advanced investment techniques', 'trending-up', 1, 2),
('Property Management', 'property-management', 'Managing rental properties effectively', 'building', 1, 3),
('Market Analysis', 'market-analysis', 'Understanding real estate markets', 'chart-bar', 1, 4),
('Legal & Finance', 'legal-finance', 'Legal aspects and financing options', 'scale', 1, 5);

-- Insert Sample Courses
INSERT INTO courses (title, slug, description, short_description, instructor_id, category_id, price, duration_hours, difficulty_level, is_published, published_at) VALUES
('Real Estate Fundamentals', 'real-estate-fundamentals', 
 'Complete guide to real estate basics including property types, market dynamics, and investment principles.',
 'Learn the essential concepts of real estate investment', 
 1, 1, 99.99, 10, 'beginner', 1, NOW()),

('Advanced Property Investment', 'advanced-property-investment',
 'Master advanced strategies for property investment including commercial real estate, REITs, and international markets.',
 'Take your property investment to the next level',
 1, 2, 199.99, 20, 'advanced', 1, NOW()),

('Rental Property Management Mastery', 'rental-property-management',
 'Everything you need to know about managing rental properties, from tenant screening to maintenance.',
 'Become a successful rental property manager',
 1, 3, 149.99, 15, 'intermediate', 1, NOW());

-- Insert Sample Lessons for Course 1
INSERT INTO course_lessons (course_id, title, description, video_duration, display_order, is_preview, is_published) VALUES
(1, 'Introduction to Real Estate', 'Overview of the real estate industry and career opportunities', 1800, 1, 1, 1),
(1, 'Types of Real Estate', 'Residential, commercial, industrial, and land properties explained', 2400, 2, 0, 1),
(1, 'Understanding Property Values', 'Factors that affect property values and appreciation', 2100, 3, 0, 1),
(1, 'Real Estate Market Cycles', 'How to identify and navigate market cycles', 1800, 4, 0, 1),
(1, 'Basic Investment Principles', 'ROI, cash flow, and other key metrics', 2700, 5, 0, 1);

-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ===========================================
-- END OF MIGRATION
-- ===========================================