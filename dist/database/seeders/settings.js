import Database from '@/config/database.js';
import { logger } from '@/utils/logger.js';
/**
 * System Settings Seeder
 * Creates default system configuration settings
 */
const settings = [
    // General Settings
    { key: 'site_name', value: 'Real Estate Masterclass LMS', type: 'string', description: 'Website name', is_public: true, group_name: 'general' },
    { key: 'site_description', value: 'Professional Real Estate Education Platform - Learn wholesaling, flipping, creative financing, and more from industry experts.', type: 'string', description: 'Website description', is_public: true, group_name: 'general' },
    { key: 'site_logo', value: '/img/logo.jpg', type: 'string', description: 'Website logo URL', is_public: true, group_name: 'general' },
    { key: 'site_favicon', value: '/favicon.ico', type: 'string', description: 'Website favicon URL', is_public: true, group_name: 'general' },
    { key: 'contact_email', value: 'support@masterclass-lms.com', type: 'string', description: 'Contact email address', is_public: true, group_name: 'general' },
    { key: 'support_phone', value: '+1 (555) 123-4567', type: 'string', description: 'Support phone number', is_public: true, group_name: 'general' },
    // Course Settings
    { key: 'default_course_duration', value: '30', type: 'number', description: 'Default course duration in days', is_public: false, group_name: 'courses' },
    { key: 'max_courses_per_instructor', value: '50', type: 'number', description: 'Maximum courses per instructor', is_public: false, group_name: 'courses' },
    { key: 'course_auto_approval', value: 'false', type: 'boolean', description: 'Auto-approve new courses', is_public: false, group_name: 'courses' },
    { key: 'featured_courses_limit', value: '6', type: 'number', description: 'Number of featured courses to display', is_public: true, group_name: 'courses' },
    // Payment Settings
    { key: 'default_currency', value: 'USD', type: 'string', description: 'Default currency for transactions', is_public: true, group_name: 'payment' },
    { key: 'payment_methods', value: '["stripe", "paypal"]', type: 'json', description: 'Enabled payment methods', is_public: true, group_name: 'payment' },
    { key: 'instructor_commission', value: '0.7', type: 'number', description: 'Default instructor commission rate', is_public: false, group_name: 'payment' },
    { key: 'tax_rate', value: '0.08', type: 'number', description: 'Default tax rate', is_public: false, group_name: 'payment' },
    // Upload Settings
    { key: 'max_file_upload_size', value: '104857600', type: 'number', description: 'Maximum file upload size in bytes (100MB)', is_public: false, group_name: 'uploads' },
    { key: 'allowed_image_types', value: '["jpg","jpeg","png","gif","webp"]', type: 'json', description: 'Allowed image file types', is_public: false, group_name: 'uploads' },
    { key: 'allowed_video_types', value: '["mp4","avi","mov","wmv","flv","webm"]', type: 'json', description: 'Allowed video file types', is_public: false, group_name: 'uploads' },
    { key: 'allowed_document_types', value: '["pdf","doc","docx","txt","rtf"]', type: 'json', description: 'Allowed document file types', is_public: false, group_name: 'uploads' },
    // Authentication Settings
    { key: 'email_verification_required', value: 'true', type: 'boolean', description: 'Require email verification for new accounts', is_public: false, group_name: 'auth' },
    { key: 'password_min_length', value: '8', type: 'number', description: 'Minimum password length', is_public: true, group_name: 'auth' },
    { key: 'login_attempts_limit', value: '5', type: 'number', description: 'Maximum login attempts before lockout', is_public: false, group_name: 'auth' },
    { key: 'session_timeout', value: '3600', type: 'number', description: 'Session timeout in seconds', is_public: false, group_name: 'auth' },
    // Certificate Settings
    { key: 'certificate_generation_enabled', value: 'true', type: 'boolean', description: 'Enable automatic certificate generation', is_public: false, group_name: 'certificates' },
    { key: 'certificate_template', value: 'default', type: 'string', description: 'Default certificate template', is_public: false, group_name: 'certificates' },
    { key: 'certificate_signature_image', value: '/img/signature.png', type: 'string', description: 'Certificate signature image', is_public: false, group_name: 'certificates' },
    // Email Settings
    { key: 'email_notifications_enabled', value: 'true', type: 'boolean', description: 'Enable email notifications', is_public: false, group_name: 'email' },
    { key: 'welcome_email_enabled', value: 'true', type: 'boolean', description: 'Send welcome email to new users', is_public: false, group_name: 'email' },
    { key: 'course_completion_email', value: 'true', type: 'boolean', description: 'Send course completion emails', is_public: false, group_name: 'email' },
    { key: 'newsletter_enabled', value: 'true', type: 'boolean', description: 'Enable newsletter functionality', is_public: false, group_name: 'email' },
    // Social Media Settings
    { key: 'facebook_url', value: 'https://facebook.com/realestateMasterclass', type: 'string', description: 'Facebook page URL', is_public: true, group_name: 'social' },
    { key: 'twitter_url', value: 'https://twitter.com/REMasterclass', type: 'string', description: 'Twitter profile URL', is_public: true, group_name: 'social' },
    { key: 'youtube_url', value: 'https://youtube.com/realestateMasterclass', type: 'string', description: 'YouTube channel URL', is_public: true, group_name: 'social' },
    { key: 'linkedin_url', value: 'https://linkedin.com/company/realestateMasterclass', type: 'string', description: 'LinkedIn page URL', is_public: true, group_name: 'social' },
    { key: 'instagram_url', value: 'https://instagram.com/realestateMasterclass', type: 'string', description: 'Instagram profile URL', is_public: true, group_name: 'social' },
    // Analytics Settings
    { key: 'google_analytics_id', value: '', type: 'string', description: 'Google Analytics tracking ID', is_public: false, group_name: 'analytics' },
    { key: 'analytics_enabled', value: 'true', type: 'boolean', description: 'Enable analytics tracking', is_public: false, group_name: 'analytics' },
    // Feature Flags
    { key: 'maintenance_mode', value: 'false', type: 'boolean', description: 'Enable maintenance mode', is_public: true, group_name: 'features' },
    { key: 'registration_enabled', value: 'true', type: 'boolean', description: 'Allow new user registration', is_public: true, group_name: 'features' },
    { key: 'course_creation_enabled', value: 'true', type: 'boolean', description: 'Allow course creation', is_public: false, group_name: 'features' },
    { key: 'quiz_system_enabled', value: 'true', type: 'boolean', description: 'Enable quiz system', is_public: false, group_name: 'features' },
    { key: 'discussion_forum_enabled', value: 'false', type: 'boolean', description: 'Enable discussion forums', is_public: false, group_name: 'features' },
    // Content Settings
    { key: 'default_lesson_duration', value: '20', type: 'number', description: 'Default lesson duration in minutes', is_public: false, group_name: 'content' },
    { key: 'video_quality_levels', value: '["360p","480p","720p","1080p"]', type: 'json', description: 'Available video quality levels', is_public: false, group_name: 'content' },
    { key: 'auto_generate_thumbnails', value: 'true', type: 'boolean', description: 'Auto-generate video thumbnails', is_public: false, group_name: 'content' },
    // Security Settings
    { key: 'rate_limit_requests', value: '100', type: 'number', description: 'Rate limit requests per window', is_public: false, group_name: 'security' },
    { key: 'rate_limit_window', value: '900', type: 'number', description: 'Rate limit window in seconds', is_public: false, group_name: 'security' },
    { key: 'cors_origins', value: '["http://localhost:5173","http://localhost:3000"]', type: 'json', description: 'Allowed CORS origins', is_public: false, group_name: 'security' },
    // API Settings
    { key: 'api_version', value: 'v1', type: 'string', description: 'Current API version', is_public: true, group_name: 'api' },
    { key: 'api_rate_limit', value: '1000', type: 'number', description: 'API rate limit per hour', is_public: false, group_name: 'api' },
    { key: 'api_documentation_url', value: '/api/docs', type: 'string', description: 'API documentation URL', is_public: true, group_name: 'api' },
];
export async function seedSystemSettings() {
    try {
        logger.info('Seeding system settings...');
        for (const setting of settings) {
            await Database.query(`
        INSERT INTO system_settings (
          id, \`key\`, value, type, description, is_public, group_name, created_at, updated_at
        ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
                setting.key,
                setting.value,
                setting.type,
                setting.description,
                setting.is_public,
                setting.group_name,
            ]);
            logger.debug(`Created setting: ${setting.key}`);
        }
        logger.info(`✓ Created ${settings.length} system settings`);
    }
    catch (error) {
        logger.error('System settings seeding failed:', error);
        throw error;
    }
}
export default seedSystemSettings;
//# sourceMappingURL=settings.js.map