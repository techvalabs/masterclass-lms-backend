-- Settings System Database Schema
-- Stores all platform configuration settings

-- Main settings table for key-value pairs
CREATE TABLE IF NOT EXISTS system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT,
  value_type ENUM('string', 'number', 'boolean', 'json', 'array') DEFAULT 'string',
  description TEXT,
  is_sensitive BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_category_key (category, setting_key),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Platform branding and configuration
CREATE TABLE IF NOT EXISTS platform_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  site_name VARCHAR(255) NOT NULL DEFAULT 'Masterclass LMS',
  site_url VARCHAR(500),
  logo_url VARCHAR(500),
  favicon_url VARCHAR(500),
  admin_email VARCHAR(255),
  support_email VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_address TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC',
  date_format VARCHAR(50) DEFAULT 'YYYY-MM-DD',
  time_format VARCHAR(50) DEFAULT '24h',
  language VARCHAR(10) DEFAULT 'en',
  currency VARCHAR(10) DEFAULT 'USD',
  maintenance_mode BOOLEAN DEFAULT FALSE,
  maintenance_message TEXT,
  footer_text TEXT,
  copyright_text VARCHAR(500),
  social_links JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Course management settings
CREATE TABLE IF NOT EXISTS course_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  default_price DECIMAL(10,2) DEFAULT 0.00,
  default_currency VARCHAR(10) DEFAULT 'USD',
  auto_publish BOOLEAN DEFAULT FALSE,
  require_approval BOOLEAN DEFAULT TRUE,
  allow_free_courses BOOLEAN DEFAULT TRUE,
  max_upload_size_mb INT DEFAULT 500,
  allowed_video_formats JSON DEFAULT '["mp4", "mov", "avi", "webm"]',
  allowed_doc_formats JSON DEFAULT '["pdf", "doc", "docx", "ppt", "pptx"]',
  allowed_image_formats JSON DEFAULT '["jpg", "jpeg", "png", "gif", "webp"]',
  enable_certificates BOOLEAN DEFAULT TRUE,
  certificate_template VARCHAR(50) DEFAULT 'default',
  completion_threshold INT DEFAULT 80,
  enable_course_reviews BOOLEAN DEFAULT TRUE,
  review_moderation BOOLEAN DEFAULT FALSE,
  enable_course_preview BOOLEAN DEFAULT TRUE,
  preview_duration_minutes INT DEFAULT 5,
  enable_drip_content BOOLEAN DEFAULT FALSE,
  enable_prerequisites BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Security settings
CREATE TABLE IF NOT EXISTS security_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  password_min_length INT DEFAULT 8,
  password_require_uppercase BOOLEAN DEFAULT TRUE,
  password_require_lowercase BOOLEAN DEFAULT TRUE,
  password_require_numbers BOOLEAN DEFAULT TRUE,
  password_require_special BOOLEAN DEFAULT TRUE,
  password_expiry_days INT DEFAULT 0,
  session_timeout_minutes INT DEFAULT 60,
  max_login_attempts INT DEFAULT 5,
  lockout_duration_minutes INT DEFAULT 30,
  enable_two_factor BOOLEAN DEFAULT FALSE,
  two_factor_required_for_admin BOOLEAN DEFAULT FALSE,
  enable_captcha BOOLEAN DEFAULT FALSE,
  captcha_type VARCHAR(50) DEFAULT 'recaptcha',
  captcha_site_key VARCHAR(255),
  captcha_secret_key VARCHAR(255),
  enable_ip_whitelist BOOLEAN DEFAULT FALSE,
  admin_ip_whitelist JSON,
  enable_audit_log BOOLEAN DEFAULT TRUE,
  audit_log_retention_days INT DEFAULT 90,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Registration and user settings
CREATE TABLE IF NOT EXISTS registration_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  enable_registration BOOLEAN DEFAULT TRUE,
  registration_type ENUM('open', 'invite_only', 'approval_required') DEFAULT 'open',
  require_email_verification BOOLEAN DEFAULT TRUE,
  email_verification_expire_hours INT DEFAULT 24,
  default_user_role VARCHAR(50) DEFAULT 'student',
  enable_social_login BOOLEAN DEFAULT FALSE,
  google_client_id VARCHAR(255),
  google_client_secret VARCHAR(255),
  facebook_app_id VARCHAR(255),
  facebook_app_secret VARCHAR(255),
  enable_instructor_registration BOOLEAN DEFAULT TRUE,
  instructor_approval_required BOOLEAN DEFAULT TRUE,
  instructor_commission_rate DECIMAL(5,2) DEFAULT 30.00,
  enable_profile_completion BOOLEAN DEFAULT TRUE,
  required_profile_fields JSON DEFAULT '["name", "email"]',
  enable_username BOOLEAN DEFAULT FALSE,
  username_min_length INT DEFAULT 3,
  enable_avatar_upload BOOLEAN DEFAULT TRUE,
  max_avatar_size_mb INT DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SEO and marketing settings
CREATE TABLE IF NOT EXISTS seo_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  og_title VARCHAR(255),
  og_description TEXT,
  og_image VARCHAR(500),
  twitter_card_type VARCHAR(50) DEFAULT 'summary_large_image',
  twitter_handle VARCHAR(100),
  google_analytics_id VARCHAR(50),
  google_tag_manager_id VARCHAR(50),
  facebook_pixel_id VARCHAR(50),
  hotjar_id VARCHAR(50),
  enable_sitemap BOOLEAN DEFAULT TRUE,
  enable_robots_txt BOOLEAN DEFAULT TRUE,
  robots_txt_content TEXT,
  enable_schema_markup BOOLEAN DEFAULT TRUE,
  canonical_url VARCHAR(500),
  enable_amp BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Backup and maintenance settings
CREATE TABLE IF NOT EXISTS backup_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  enable_auto_backup BOOLEAN DEFAULT TRUE,
  backup_frequency ENUM('daily', 'weekly', 'monthly') DEFAULT 'weekly',
  backup_time TIME DEFAULT '03:00:00',
  backup_retention_days INT DEFAULT 30,
  backup_storage_type ENUM('local', 's3', 'google_drive', 'dropbox') DEFAULT 'local',
  backup_path VARCHAR(500) DEFAULT '/backups',
  s3_backup_bucket VARCHAR(255),
  s3_backup_region VARCHAR(50),
  enable_database_optimization BOOLEAN DEFAULT TRUE,
  optimization_frequency ENUM('daily', 'weekly', 'monthly') DEFAULT 'weekly',
  enable_cache_clearing BOOLEAN DEFAULT TRUE,
  cache_clear_frequency_hours INT DEFAULT 24,
  enable_log_rotation BOOLEAN DEFAULT TRUE,
  log_retention_days INT DEFAULT 30,
  enable_temp_file_cleanup BOOLEAN DEFAULT TRUE,
  temp_file_retention_hours INT DEFAULT 24,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings change history for audit
CREATE TABLE IF NOT EXISTS settings_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  setting_key VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by INT,
  change_reason TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category_key (category, setting_key),
  INDEX idx_changed_by (changed_by),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default values
INSERT INTO platform_config (site_name, timezone, language, currency) 
VALUES ('Masterclass LMS', 'UTC', 'en', 'USD')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO course_settings (default_price, auto_publish, require_approval) 
VALUES (0.00, FALSE, TRUE)
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO security_settings (password_min_length, session_timeout_minutes) 
VALUES (8, 60)
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO registration_settings (enable_registration, registration_type) 
VALUES (TRUE, 'open')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO seo_settings (meta_title) 
VALUES ('Masterclass LMS - Online Learning Platform')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO backup_settings (enable_auto_backup, backup_frequency) 
VALUES (TRUE, 'weekly')
ON DUPLICATE KEY UPDATE id = id;