-- ===========================================
-- Real Estate Masterclass LMS Initial Data
-- Migration: 002_insert_initial_data.sql
-- ===========================================

-- ===========================================
-- ROLES AND PERMISSIONS
-- ===========================================

INSERT INTO roles (id, name, description, permissions, is_active) VALUES
(1, 'student', 'Regular student role with basic learning permissions', JSON_ARRAY(
    'course.view',
    'course.enroll',
    'lesson.view',
    'quiz.attempt',
    'assignment.submit',
    'progress.view',
    'certificate.download',
    'review.create',
    'profile.update',
    'notification.view'
), TRUE),

(2, 'instructor', 'Instructor role with course creation and management permissions', JSON_ARRAY(
    'course.view',
    'course.create',
    'course.update',
    'course.delete',
    'lesson.create',
    'lesson.update',
    'lesson.delete',
    'quiz.create',
    'quiz.update',
    'quiz.delete',
    'assignment.create',
    'assignment.update',
    'assignment.delete',
    'assignment.grade',
    'student.view',
    'analytics.view',
    'earnings.view',
    'profile.update',
    'notification.view'
), TRUE),

(3, 'admin', 'Administrator role with full system access', JSON_ARRAY(
    'system.manage',
    'user.view',
    'user.create',
    'user.update',
    'user.delete',
    'user.impersonate',
    'course.view',
    'course.create',
    'course.update',
    'course.delete',
    'course.approve',
    'course.reject',
    'instructor.view',
    'instructor.approve',
    'instructor.reject',
    'payment.view',
    'payment.refund',
    'coupon.create',
    'coupon.update',
    'coupon.delete',
    'analytics.view',
    'settings.update',
    'backup.create',
    'backup.restore',
    'log.view',
    'notification.send'
), TRUE),

(4, 'moderator', 'Content moderator role with review and approval permissions', JSON_ARRAY(
    'course.view',
    'course.review',
    'course.approve',
    'course.reject',
    'review.moderate',
    'user.view',
    'content.moderate',
    'analytics.view',
    'notification.view'
), TRUE);

-- ===========================================
-- SYSTEM SETTINGS
-- ===========================================

-- General Settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('site_name', 'Real Estate Masterclass LMS', 'string', 'Site name displayed in header and emails', TRUE),
('site_description', 'Learn real estate investing from industry experts', 'string', 'Site description for SEO', TRUE),
('site_url', 'https://realestate-masterclass.com', 'string', 'Primary site URL', TRUE),
('admin_email', 'admin@realestate-masterclass.com', 'string', 'Primary admin email', FALSE),
('contact_email', 'support@realestate-masterclass.com', 'string', 'Public contact email', TRUE),
('support_phone', '+1-555-123-4567', 'string', 'Support phone number', TRUE),
('timezone', 'America/New_York', 'string', 'Default timezone', FALSE),
('currency', 'USD', 'string', 'Default currency code', TRUE),
('language', 'en', 'string', 'Default language', TRUE),
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', FALSE);

-- Email Settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('email_driver', 'smtp', 'string', 'Email driver (smtp, sendmail, etc.)', FALSE),
('smtp_host', 'smtp.gmail.com', 'string', 'SMTP server host', FALSE),
('smtp_port', '587', 'number', 'SMTP server port', FALSE),
('smtp_encryption', 'tls', 'string', 'SMTP encryption method', FALSE),
('smtp_username', '', 'string', 'SMTP username', FALSE),
('smtp_password', '', 'string', 'SMTP password', FALSE),
('mail_from_address', 'noreply@realestate-masterclass.com', 'string', 'Default from email address', FALSE),
('mail_from_name', 'Real Estate Masterclass', 'string', 'Default from name', FALSE);

-- Payment Settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('payment_currency', 'USD', 'string', 'Payment currency', TRUE),
('payment_tax_rate', '0.00', 'number', 'Default tax rate percentage', FALSE),
('stripe_publishable_key', '', 'string', 'Stripe publishable key', TRUE),
('stripe_secret_key', '', 'string', 'Stripe secret key', FALSE),
('stripe_webhook_secret', '', 'string', 'Stripe webhook secret', FALSE),
('paypal_client_id', '', 'string', 'PayPal client ID', TRUE),
('paypal_client_secret', '', 'string', 'PayPal client secret', FALSE),
('paypal_mode', 'sandbox', 'string', 'PayPal mode (sandbox/live)', FALSE),
('commission_rate', '30.00', 'number', 'Platform commission rate percentage', FALSE),
('minimum_payout', '50.00', 'number', 'Minimum instructor payout amount', FALSE);

-- Course Settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('course_approval_required', 'true', 'boolean', 'Require admin approval for new courses', FALSE),
('auto_enroll_free_courses', 'true', 'boolean', 'Auto-enroll users in free courses', TRUE),
('certificate_generation', 'true', 'boolean', 'Enable certificate generation', TRUE),
('course_review_required', 'false', 'boolean', 'Require course completion to review', TRUE),
('max_file_upload_size', '104857600', 'number', 'Maximum file upload size in bytes (100MB)', FALSE),
('allowed_video_formats', '["mp4", "webm", "avi", "mov"]', 'json', 'Allowed video file formats', FALSE),
('allowed_document_formats', '["pdf", "doc", "docx", "ppt", "pptx"]', 'json', 'Allowed document formats', FALSE);

-- Security Settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('password_min_length', '8', 'number', 'Minimum password length', TRUE),
('password_require_uppercase', 'true', 'boolean', 'Require uppercase letters in password', TRUE),
('password_require_lowercase', 'true', 'boolean', 'Require lowercase letters in password', TRUE),
('password_require_numbers', 'true', 'boolean', 'Require numbers in password', TRUE),
('password_require_symbols', 'false', 'boolean', 'Require symbols in password', TRUE),
('session_lifetime', '43200', 'number', 'Session lifetime in minutes (30 days)', FALSE),
('max_login_attempts', '5', 'number', 'Maximum login attempts before lockout', FALSE),
('lockout_duration', '30', 'number', 'Account lockout duration in minutes', FALSE),
('two_factor_authentication', 'false', 'boolean', 'Enable 2FA for all users', FALSE),
('email_verification_required', 'true', 'boolean', 'Require email verification for new accounts', TRUE);

-- Content and Media Settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('video_provider', 'youtube', 'string', 'Default video provider (youtube, vimeo, wistia)', FALSE),
('cdn_url', '', 'string', 'CDN URL for static assets', FALSE),
('file_storage', 'local', 'string', 'File storage driver (local, s3, etc.)', FALSE),
('aws_access_key', '', 'string', 'AWS access key for S3 storage', FALSE),
('aws_secret_key', '', 'string', 'AWS secret key for S3 storage', FALSE),
('aws_region', 'us-east-1', 'string', 'AWS region', FALSE),
('aws_bucket', '', 'string', 'AWS S3 bucket name', FALSE),
('image_optimization', 'true', 'boolean', 'Enable automatic image optimization', FALSE),
('video_compression', 'false', 'boolean', 'Enable video compression', FALSE);

-- Learning Settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('progress_tracking', 'true', 'boolean', 'Enable detailed progress tracking', TRUE),
('lesson_completion_threshold', '80', 'number', 'Percentage to mark lesson as complete', FALSE),
('course_completion_threshold', '90', 'number', 'Percentage to mark course as complete', FALSE),
('quiz_passing_score', '60', 'number', 'Default quiz passing score percentage', TRUE),
('max_quiz_attempts', '3', 'number', 'Maximum quiz attempts allowed', TRUE),
('assignment_late_submission', 'true', 'boolean', 'Allow late assignment submissions', TRUE),
('discussion_forums', 'false', 'boolean', 'Enable course discussion forums', FALSE),
('peer_review', 'false', 'boolean', 'Enable peer review for assignments', FALSE);

-- Notification Settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('email_notifications', 'true', 'boolean', 'Enable email notifications', FALSE),
('push_notifications', 'false', 'boolean', 'Enable push notifications', FALSE),
('welcome_email', 'true', 'boolean', 'Send welcome email to new users', FALSE),
('course_enrollment_notification', 'true', 'boolean', 'Notify instructors of new enrollments', FALSE),
('assignment_submission_notification', 'true', 'boolean', 'Notify instructors of submissions', FALSE),
('course_completion_notification', 'true', 'boolean', 'Notify users of course completion', FALSE),
('payment_confirmation_notification', 'true', 'boolean', 'Send payment confirmation emails', FALSE),
('weekly_progress_report', 'false', 'boolean', 'Send weekly progress reports', FALSE);

-- SEO and Analytics Settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('google_analytics_id', '', 'string', 'Google Analytics tracking ID', TRUE),
('facebook_pixel_id', '', 'string', 'Facebook Pixel ID', TRUE),
('meta_title', 'Real Estate Masterclass - Learn Real Estate Investing', 'string', 'Default meta title', TRUE),
('meta_description', 'Learn real estate investing from industry experts through comprehensive online courses. Start your journey today!', 'string', 'Default meta description', TRUE),
('meta_keywords', 'real estate, investing, education, online courses, property management', 'string', 'Default meta keywords', TRUE),
('robots_txt', 'User-agent: *\nAllow: /', 'string', 'Robots.txt content', TRUE),
('sitemap_generation', 'true', 'boolean', 'Enable automatic sitemap generation', FALSE);

-- Social Media Settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('facebook_url', 'https://facebook.com/realestateMasterclass', 'string', 'Facebook page URL', TRUE),
('twitter_url', 'https://twitter.com/REMasterclass', 'string', 'Twitter profile URL', TRUE),
('linkedin_url', 'https://linkedin.com/company/real-estate-masterclass', 'string', 'LinkedIn company page URL', TRUE),
('youtube_url', 'https://youtube.com/c/realestateMasterclass', 'string', 'YouTube channel URL', TRUE),
('instagram_url', 'https://instagram.com/realestateMasterclass', 'string', 'Instagram profile URL', TRUE),
('social_login_facebook', 'false', 'boolean', 'Enable Facebook login', TRUE),
('social_login_google', 'false', 'boolean', 'Enable Google login', TRUE),
('social_login_linkedin', 'false', 'boolean', 'Enable LinkedIn login', TRUE);

-- API and Integration Settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('api_rate_limit', '1000', 'number', 'API requests per hour per user', FALSE),
('api_version', 'v1', 'string', 'Current API version', TRUE),
('webhook_timeout', '30', 'number', 'Webhook timeout in seconds', FALSE),
('third_party_integrations', 'true', 'boolean', 'Enable third-party integrations', FALSE),
('zapier_integration', 'false', 'boolean', 'Enable Zapier integration', FALSE),
('slack_integration', 'false', 'boolean', 'Enable Slack integration', FALSE),
('mailchimp_integration', 'false', 'boolean', 'Enable Mailchimp integration', FALSE);

-- Mobile App Settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('mobile_app_enabled', 'false', 'boolean', 'Enable mobile app features', TRUE),
('app_store_url', '', 'string', 'iOS App Store URL', TRUE),
('play_store_url', '', 'string', 'Google Play Store URL', TRUE),
('app_version', '1.0.0', 'string', 'Current mobile app version', TRUE),
('offline_content', 'false', 'boolean', 'Enable offline content download', TRUE),
('push_notification_key', '', 'string', 'Firebase push notification key', FALSE);

-- ===========================================
-- DEFAULT ADMIN USER
-- ===========================================

-- Insert default admin user (password: Admin123!)
-- Note: In production, this should be changed immediately
INSERT INTO users (
    id, 
    name, 
    email, 
    password_hash, 
    role_id, 
    email_verified, 
    email_verified_at, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    1,
    'System Administrator',
    'admin@realestate-masterclass.com',
    '$2b$12$LQv3c1yqBwWFcXsjHrDOuef2cjq5F9F8YhfYWZ3U1N2qKW9FhQ9Hy', -- Admin123!
    3,
    TRUE,
    NOW(),
    TRUE,
    NOW(),
    NOW()
);

-- ===========================================
-- SAMPLE INSTRUCTOR USER
-- ===========================================

-- Insert sample instructor user (password: Instructor123!)
INSERT INTO users (
    id,
    name,
    email,
    password_hash,
    role_id,
    email_verified,
    email_verified_at,
    is_active,
    bio,
    location,
    website,
    created_at,
    updated_at
) VALUES (
    2,
    'Robert Smith',
    'robert.smith@realestate-masterclass.com',
    '$2b$12$8Q5i7TF9n.Xr6WmKzYdV8OoGhQlB2rT3H4YF7hN9vK1L3pQ5mE2nW', -- Instructor123!
    2,
    TRUE,
    NOW(),
    TRUE,
    'Experienced real estate investor with over 15 years in the industry. Specialized in residential and commercial property investment strategies.',
    'New York, NY',
    'https://robertsmith-realestate.com',
    NOW(),
    NOW()
);

-- Insert instructor profile for Robert Smith
INSERT INTO instructors (
    id,
    user_id,
    experience,
    qualifications,
    certifications,
    specialties,
    hourly_rate,
    commission_rate,
    status,
    approved_at,
    approved_by,
    created_at,
    updated_at
) VALUES (
    1,
    2,
    'Over 15 years of experience in real estate investing, property management, and real estate education. Has successfully flipped over 200 properties and built a portfolio worth $10M+.',
    JSON_ARRAY(
        'MBA in Real Estate Finance - Wharton School',
        'Bachelor of Business Administration - NYU Stern',
        'Real Estate License - New York State'
    ),
    JSON_ARRAY(
        'Certified Commercial Investment Member (CCIM)',
        'Real Estate Investment Advisor (REIA)',
        'Property Management Professional (PMP)'
    ),
    JSON_ARRAY(
        'Residential Real Estate Investment',
        'Commercial Property Analysis',
        'Property Management',
        'Real Estate Finance',
        'Market Analysis',
        'Fix and Flip Strategies'
    ),
    150.00,
    70.00,
    'approved',
    NOW(),
    1,
    NOW(),
    NOW()
);

-- ===========================================
-- SAMPLE STUDENT USER
-- ===========================================

-- Insert sample student user (password: Student123!)
INSERT INTO users (
    id,
    name,
    email,
    password_hash,
    role_id,
    email_verified,
    email_verified_at,
    is_active,
    bio,
    location,
    created_at,
    updated_at
) VALUES (
    3,
    'Sarah Johnson',
    'sarah.johnson@example.com',
    '$2b$12$9R6k8UG0o.Ys7XnLzZeW9P1H2sC4tR5Y6gI8jL9mN0kO1pQ3rS2vX', -- Student123!
    1,
    TRUE,
    NOW(),
    TRUE,
    'Aspiring real estate investor looking to learn the fundamentals of property investment and build a successful portfolio.',
    'Los Angeles, CA',
    NOW(),
    NOW()
);

-- ===========================================
-- ACTIVITY LOG ENTRY
-- ===========================================

INSERT INTO activity_logs (
    user_id,
    action,
    entity_type,
    description,
    created_at
) VALUES (
    1,
    'database_initialized',
    'system',
    'Database schema and initial data created',
    NOW()
);

-- ===========================================
-- VERSION TRACKING
-- ===========================================

UPDATE system_settings 
SET setting_value = '1.0.0', updated_at = NOW() 
WHERE setting_key = 'schema_version';

INSERT INTO system_settings (setting_key, setting_value, setting_type, description, created_at) VALUES
('initial_data_version', '1.0.0', 'string', 'Initial data version', NOW())
ON DUPLICATE KEY UPDATE 
setting_value = '1.0.0', 
updated_at = NOW();