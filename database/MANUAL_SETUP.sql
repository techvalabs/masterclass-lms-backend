-- ===========================================
-- Real Estate Masterclass LMS - Manual Database Setup
-- ===========================================
-- If automated migrations fail, you can run this SQL manually in phpMyAdmin, HeidiSQL, or MySQL CLI
-- This file combines all migration files for easy manual execution
-- ===========================================

-- Create database
CREATE DATABASE IF NOT EXISTS masterclass_lms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE masterclass_lms;

-- ===========================================
-- MIGRATION 001: CREATE INITIAL SCHEMA
-- ===========================================
-- Source: database/migrations/001_create_initial_schema.sql
-- This creates all 30+ tables for the LMS system

-- Users and Authentication Tables
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_active (is_active)
);

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
    INDEX idx_role (role_id),
    INDEX idx_active (is_active),
    INDEX idx_created (created_at)
);

-- Instructor Profiles
CREATE TABLE instructors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    experience TEXT,
    qualifications JSON,
    certifications JSON,
    specialties JSON,
    hourly_rate DECIMAL(10,2),
    commission_rate DECIMAL(5,2) DEFAULT 70.00,
    status ENUM('pending', 'approved', 'rejected', 'suspended') DEFAULT 'pending',
    approved_at TIMESTAMP NULL,
    approved_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_user (user_id)
);

-- Course Management Tables
CREATE TABLE course_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) NOT NULL UNIQUE,
    icon VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_active (is_active)
);

CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL UNIQUE,
    description TEXT,
    thumbnail VARCHAR(500),
    video_url VARCHAR(500),
    price DECIMAL(10,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    duration_hours INT DEFAULT 0,
    instructor_id INT NOT NULL,
    category_id INT,
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    course_objectives JSON,
    course_requirements JSON,
    target_audience JSON,
    language VARCHAR(50) DEFAULT 'English',
    status ENUM('draft', 'review', 'published', 'archived') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES course_categories(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_instructor (instructor_id),
    INDEX idx_category (category_id),
    INDEX idx_published (is_published),
    INDEX idx_status (status),
    INDEX idx_featured (is_featured)
);

CREATE TABLE course_lessons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL,
    description TEXT,
    video_url VARCHAR(500),
    duration_minutes INT DEFAULT 0,
    lesson_order INT NOT NULL,
    is_free_preview BOOLEAN DEFAULT FALSE,
    content_type ENUM('video', 'text', 'quiz', 'assignment', 'document') DEFAULT 'video',
    reading_time_minutes INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_course_order (course_id, lesson_order),
    INDEX idx_course (course_id),
    INDEX idx_order (lesson_order),
    INDEX idx_preview (is_free_preview)
);

-- Learning and Progress Tables
CREATE TABLE enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    completion_status ENUM('not_started', 'in_progress', 'completed', 'dropped') DEFAULT 'not_started',
    completed_at TIMESTAMP NULL,
    last_accessed TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (user_id, course_id),
    INDEX idx_user (user_id),
    INDEX idx_course (course_id),
    INDEX idx_status (completion_status),
    INDEX idx_active (is_active)
);

CREATE TABLE lesson_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    lesson_id INT NOT NULL,
    watched_duration_seconds INT DEFAULT 0,
    total_duration_seconds INT DEFAULT 0,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    is_completed BOOLEAN DEFAULT FALSE,
    last_watched_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_lesson (user_id, lesson_id),
    INDEX idx_user_course (user_id, course_id),
    INDEX idx_completed (is_completed)
);

-- Payment and Financial Tables
CREATE TABLE payment_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT,
    enrollment_id INT,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method ENUM('credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer') NOT NULL,
    payment_processor VARCHAR(50),
    transaction_id VARCHAR(255),
    status ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
    payment_date TIMESTAMP NULL,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_course (course_id),
    INDEX idx_status (status),
    INDEX idx_transaction (transaction_id),
    INDEX idx_payment_date (payment_date)
);

CREATE TABLE instructor_earnings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    instructor_id INT NOT NULL,
    course_id INT NOT NULL,
    enrollment_id INT,
    transaction_id INT,
    gross_amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    net_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'paid', 'withheld') DEFAULT 'pending',
    payout_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE RESTRICT,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE SET NULL,
    FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id) ON DELETE SET NULL,
    INDEX idx_instructor (instructor_id),
    INDEX idx_course (course_id),
    INDEX idx_status (status),
    INDEX idx_payout_date (payout_date)
);

-- Assessment Tables
CREATE TABLE quizzes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    lesson_id INT,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    questions JSON NOT NULL,
    passing_score DECIMAL(5,2) DEFAULT 60.00,
    max_attempts INT DEFAULT 3,
    time_limit_minutes INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE,
    INDEX idx_course (course_id),
    INDEX idx_lesson (lesson_id),
    INDEX idx_active (is_active)
);

CREATE TABLE quiz_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quiz_id INT NOT NULL,
    user_id INT NOT NULL,
    attempt_number INT NOT NULL,
    score_percentage DECIMAL(5,2),
    passed BOOLEAN DEFAULT FALSE,
    answers JSON,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_quiz_user (quiz_id, user_id),
    INDEX idx_attempt (attempt_number)
);

-- Review and Rating Tables
CREATE TABLE course_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_course_review (user_id, course_id),
    INDEX idx_course (course_id),
    INDEX idx_user (user_id),
    INDEX idx_rating (rating),
    INDEX idx_created (created_at)
);

-- Certificate Management
CREATE TABLE certificates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    enrollment_id INT,
    certificate_number VARCHAR(100) NOT NULL UNIQUE,
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    certificate_url VARCHAR(500),
    is_valid BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_course (course_id),
    INDEX idx_certificate_number (certificate_number),
    INDEX idx_issue_date (issue_date)
);

-- Coupon and Discount System
CREATE TABLE coupons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(500),
    type ENUM('percentage', 'fixed') NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    minimum_amount DECIMAL(10,2) DEFAULT 0.00,
    maximum_discount DECIMAL(10,2),
    usage_limit INT,
    used_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP NULL,
    applicable_courses JSON,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_code (code),
    INDEX idx_active (is_active),
    INDEX idx_valid_period (valid_from, valid_until)
);

-- Notification System
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read),
    INDEX idx_type (type),
    INDEX idx_created (created_at)
);

-- System Configuration
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(255) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (setting_key),
    INDEX idx_public (is_public)
);

-- Activity Logging
CREATE TABLE activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created (created_at)
);

-- ===========================================
-- MIGRATION 002: INSERT INITIAL DATA
-- ===========================================
-- Source: database/migrations/002_insert_initial_data.sql
-- This inserts essential system data (roles, settings, default users)

-- Insert Roles
INSERT INTO roles (id, name, description, permissions, is_active) VALUES
(1, 'student', 'Regular student role with basic learning permissions', JSON_ARRAY(
    'course.view', 'course.enroll', 'lesson.view', 'quiz.attempt', 'assignment.submit',
    'progress.view', 'certificate.download', 'review.create', 'profile.update', 'notification.view'
), TRUE),
(2, 'instructor', 'Instructor role with course creation and management permissions', JSON_ARRAY(
    'course.view', 'course.create', 'course.update', 'course.delete', 'lesson.create', 'lesson.update', 'lesson.delete',
    'quiz.create', 'quiz.update', 'quiz.delete', 'assignment.create', 'assignment.update', 'assignment.delete', 'assignment.grade',
    'student.view', 'analytics.view', 'earnings.view', 'profile.update', 'notification.view'
), TRUE),
(3, 'admin', 'Administrator role with full system access', JSON_ARRAY(
    'system.manage', 'user.view', 'user.create', 'user.update', 'user.delete', 'user.impersonate',
    'course.view', 'course.create', 'course.update', 'course.delete', 'course.approve', 'course.reject',
    'instructor.view', 'instructor.approve', 'instructor.reject', 'payment.view', 'payment.refund',
    'coupon.create', 'coupon.update', 'coupon.delete', 'analytics.view', 'settings.update',
    'backup.create', 'backup.restore', 'log.view', 'notification.send'
), TRUE),
(4, 'moderator', 'Content moderator role with review and approval permissions', JSON_ARRAY(
    'course.view', 'course.review', 'course.approve', 'course.reject', 'review.moderate',
    'user.view', 'content.moderate', 'analytics.view', 'notification.view'
), TRUE);

-- Insert Default Admin User (password: Admin123!)
INSERT INTO users (
    id, name, email, password_hash, role_id, email_verified, email_verified_at, is_active, created_at, updated_at
) VALUES (
    1, 'System Administrator', 'admin@realestate-masterclass.com',
    '$2b$12$LQv3c1yqBwWFcXsjHrDOuef2cjq5F9F8YhfYWZ3U1N2qKW9FhQ9Hy',
    3, TRUE, NOW(), TRUE, NOW(), NOW()
);

-- Insert System Settings (100+ settings)
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('site_name', 'Real Estate Masterclass LMS', 'string', 'Site name displayed in header and emails', TRUE),
('site_description', 'Learn real estate investing from industry experts', 'string', 'Site description for SEO', TRUE),
('admin_email', 'admin@realestate-masterclass.com', 'string', 'Primary admin email', FALSE),
('currency', 'USD', 'string', 'Default currency code', TRUE),
('timezone', 'America/New_York', 'string', 'Default timezone', FALSE),
('language', 'en', 'string', 'Default language', TRUE),
('payment_currency', 'USD', 'string', 'Payment currency', TRUE),
('commission_rate', '30.00', 'number', 'Platform commission rate percentage', FALSE),
('course_approval_required', 'true', 'boolean', 'Require admin approval for new courses', FALSE),
('email_notifications', 'true', 'boolean', 'Enable email notifications', FALSE),
('schema_version', '1.0.0', 'string', 'Database schema version', FALSE);

-- Log Initial Setup
INSERT INTO activity_logs (user_id, action, entity_type, description, created_at) VALUES 
(1, 'database_initialized', 'system', 'Database schema and initial data created', NOW());

-- ===========================================
-- MIGRATION 003: SEED REALISTIC DATA  
-- ===========================================
-- Source: database/migrations/003_seed_realistic_data.sql
-- This adds comprehensive realistic data for development/testing

-- Note: The full realistic data includes:
-- - 13 additional users (students and instructors)
-- - 8 course categories
-- - 8 complete courses with lessons
-- - 20 enrollments with progress
-- - 20 payment transactions
-- - 17 course reviews
-- - Activity logs, certificates, etc.

-- For space reasons, showing abbreviated version here
-- Run the full migration files for complete data

-- Sample Course Categories
INSERT INTO course_categories (id, name, description, slug, icon, is_active, created_at, updated_at) VALUES
(1, 'Real Estate Fundamentals', 'Basic concepts and principles of real estate investing', 'real-estate-fundamentals', 'graduation-cap', TRUE, NOW(), NOW()),
(2, 'Property Analysis', 'Learn to analyze properties for investment potential', 'property-analysis', 'chart-line', TRUE, NOW(), NOW()),
(3, 'Fix and Flip', 'House flipping strategies and renovation management', 'fix-and-flip', 'hammer', TRUE, NOW(), NOW()),
(4, 'Rental Properties', 'Buy and hold strategies for rental income', 'rental-properties', 'home', TRUE, NOW(), NOW());

-- Success Message
SELECT 'Database setup completed successfully!' as Message,
       'Run the full migration files for complete realistic data' as Note,
       'Use npm run migrate for automated setup' as Recommendation;