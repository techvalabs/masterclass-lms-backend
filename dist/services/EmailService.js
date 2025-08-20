import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '@/config/index.js';
import { logger } from '@/utils/logger.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * Email Service
 * Handles all email communications using Nodemailer and Handlebars templates
 */
export class EmailService {
    static transporter;
    static templates = new Map();
    /**
     * Initialize email service
     */
    static async initialize() {
        try {
            // Create transporter
            this.transporter = nodemailer.createTransport({
                host: config.email.host,
                port: config.email.port,
                secure: config.email.secure,
                auth: {
                    user: config.email.user,
                    pass: config.email.pass,
                },
                pool: true,
                maxConnections: 5,
                maxMessages: 100,
            });
            // Verify connection
            await this.transporter.verify();
            logger.info('Email service initialized successfully');
            // Load email templates
            await this.loadTemplates();
        }
        catch (error) {
            logger.error('Email service initialization failed:', error);
            throw error;
        }
    }
    /**
     * Load email templates
     */
    static async loadTemplates() {
        try {
            const templatesDir = path.join(__dirname, '../templates/emails');
            // Create templates directory if it doesn't exist
            await fs.ensureDir(templatesDir);
            const templateFiles = await fs.readdir(templatesDir);
            for (const file of templateFiles) {
                if (file.endsWith('.hbs')) {
                    const templateName = file.replace('.hbs', '');
                    const templatePath = path.join(templatesDir, file);
                    const templateContent = await fs.readFile(templatePath, 'utf-8');
                    this.templates.set(templateName, handlebars.compile(templateContent));
                    logger.debug(`Loaded email template: ${templateName}`);
                }
            }
            logger.info(`Loaded ${this.templates.size} email templates`);
        }
        catch (error) {
            logger.warn('Failed to load email templates:', error);
        }
    }
    /**
     * Send email using template
     */
    static async sendEmail(options) {
        try {
            let html = options.html;
            // Use template if specified
            if (options.template && this.templates.has(options.template)) {
                const template = this.templates.get(options.template);
                html = template(options.templateData || {});
            }
            const mailOptions = {
                from: `${config.email.from_name} <${config.email.from}>`,
                to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
                subject: options.subject,
                html,
                text: options.text,
                attachments: options.attachments,
            };
            const result = await this.transporter.sendMail(mailOptions);
            logger.email('Email sent successfully', mailOptions.to, options.subject);
            return true;
        }
        catch (error) {
            logger.email('Email send failed', Array.isArray(options.to) ? options.to.join(', ') : options.to, options.subject);
            logger.error('Email error details:', error);
            return false;
        }
    }
    /**
     * Send verification email
     */
    static async sendVerificationEmail(email, name, token) {
        const verificationUrl = `${config.security.cors_origin}/verify-email?token=${token}`;
        return this.sendEmail({
            to: email,
            subject: 'Verify Your Email Address',
            template: 'verification',
            templateData: {
                name,
                verificationUrl,
                supportEmail: config.email.from,
            },
            // Fallback HTML if template doesn't exist
            html: `
        <h2>Welcome to Real Estate Masterclass!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering. Please click the link below to verify your email address:</p>
        <p><a href="${verificationUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
        <p>If you didn't create this account, you can safely ignore this email.</p>
        <p>Best regards,<br>The Real Estate Masterclass Team</p>
      `,
        });
    }
    /**
     * Send password reset email
     */
    static async sendPasswordResetEmail(email, name, token) {
        const resetUrl = `${config.security.cors_origin}/reset-password?token=${token}`;
        return this.sendEmail({
            to: email,
            subject: 'Reset Your Password',
            template: 'password-reset',
            templateData: {
                name,
                resetUrl,
                supportEmail: config.email.from,
            },
            html: `
        <h2>Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>You requested to reset your password. Click the link below to create a new password:</p>
        <p><a href="${resetUrl}" style="background: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>Best regards,<br>The Real Estate Masterclass Team</p>
      `,
        });
    }
    /**
     * Send password changed confirmation email
     */
    static async sendPasswordChangedEmail(email, name) {
        return this.sendEmail({
            to: email,
            subject: 'Password Changed Successfully',
            template: 'password-changed',
            templateData: {
                name,
                supportEmail: config.email.from,
                loginUrl: `${config.security.cors_origin}/login`,
            },
            html: `
        <h2>Password Changed Successfully</h2>
        <p>Hi ${name},</p>
        <p>Your password has been changed successfully.</p>
        <p>If you didn't make this change, please contact us immediately at ${config.email.from}.</p>
        <p><a href="${config.security.cors_origin}/login">Login to your account</a></p>
        <p>Best regards,<br>The Real Estate Masterclass Team</p>
      `,
        });
    }
    /**
     * Send welcome email after email verification
     */
    static async sendWelcomeEmail(email, name, role) {
        return this.sendEmail({
            to: email,
            subject: 'Welcome to Real Estate Masterclass!',
            template: 'welcome',
            templateData: {
                name,
                role,
                dashboardUrl: `${config.security.cors_origin}/dashboard`,
                coursesUrl: `${config.security.cors_origin}/courses`,
                supportEmail: config.email.from,
            },
            html: `
        <h2>Welcome to Real Estate Masterclass!</h2>
        <p>Hi ${name},</p>
        <p>Welcome to our platform! We're excited to have you join our community of real estate professionals.</p>
        <p>Here's what you can do now:</p>
        <ul>
          <li><a href="${config.security.cors_origin}/courses">Browse our courses</a></li>
          <li><a href="${config.security.cors_origin}/dashboard">Visit your dashboard</a></li>
          <li>Start learning and building your real estate expertise</li>
        </ul>
        <p>If you have any questions, feel free to contact us at ${config.email.from}.</p>
        <p>Happy learning!<br>The Real Estate Masterclass Team</p>
      `,
        });
    }
    /**
     * Send course enrollment confirmation
     */
    static async sendEnrollmentConfirmation(email, name, courseName, courseUrl) {
        return this.sendEmail({
            to: email,
            subject: `Enrollment Confirmed: ${courseName}`,
            template: 'enrollment-confirmation',
            templateData: {
                name,
                courseName,
                courseUrl,
                supportEmail: config.email.from,
            },
            html: `
        <h2>Enrollment Confirmed!</h2>
        <p>Hi ${name},</p>
        <p>You have successfully enrolled in <strong>${courseName}</strong>.</p>
        <p><a href="${courseUrl}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Start Learning</a></p>
        <p>You can access this course anytime from your dashboard.</p>
        <p>Happy learning!<br>The Real Estate Masterclass Team</p>
      `,
        });
    }
    /**
     * Send course completion certificate
     */
    static async sendCertificate(email, name, courseName, certificateUrl) {
        return this.sendEmail({
            to: email,
            subject: `Congratulations! Course Certificate - ${courseName}`,
            template: 'certificate',
            templateData: {
                name,
                courseName,
                certificateUrl,
                supportEmail: config.email.from,
            },
            html: `
        <h2>Congratulations on Completing ${courseName}!</h2>
        <p>Hi ${name},</p>
        <p>You have successfully completed <strong>${courseName}</strong>!</p>
        <p>Your certificate is ready for download:</p>
        <p><a href="${certificateUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download Certificate</a></p>
        <p>We're proud of your achievement and hope you continue your learning journey with us.</p>
        <p>Best regards,<br>The Real Estate Masterclass Team</p>
      `,
        });
    }
    /**
     * Send quiz completion notification
     */
    static async sendQuizCompletion(email, name, quizName, score, passed) {
        const subject = passed
            ? `Quiz Passed: ${quizName}`
            : `Quiz Completed: ${quizName}`;
        return this.sendEmail({
            to: email,
            subject,
            template: 'quiz-completion',
            templateData: {
                name,
                quizName,
                score,
                passed,
                supportEmail: config.email.from,
            },
            html: `
        <h2>Quiz ${passed ? 'Passed' : 'Completed'}!</h2>
        <p>Hi ${name},</p>
        <p>You have completed <strong>${quizName}</strong>.</p>
        <p>Your score: <strong>${score}%</strong></p>
        ${passed
                ? '<p style="color: green;">Congratulations! You passed the quiz.</p>'
                : '<p style="color: orange;">You can retake the quiz to improve your score.</p>'}
        <p>Keep up the great work!<br>The Real Estate Masterclass Team</p>
      `,
        });
    }
    /**
     * Send instructor application notification
     */
    static async sendInstructorApplication(email, name, applicationId) {
        return this.sendEmail({
            to: email,
            subject: 'Instructor Application Received',
            template: 'instructor-application',
            templateData: {
                name,
                applicationId,
                supportEmail: config.email.from,
            },
            html: `
        <h2>Instructor Application Received</h2>
        <p>Hi ${name},</p>
        <p>Thank you for applying to become an instructor on Real Estate Masterclass!</p>
        <p>Application ID: <strong>${applicationId}</strong></p>
        <p>We will review your application and get back to you within 3-5 business days.</p>
        <p>If you have any questions, please contact us at ${config.email.from}.</p>
        <p>Best regards,<br>The Real Estate Masterclass Team</p>
      `,
        });
    }
    /**
     * Send newsletter/marketing emails
     */
    static async sendNewsletter(recipients, subject, content) {
        // Send to recipients in batches to avoid rate limiting
        const batchSize = 50;
        const batches = [];
        for (let i = 0; i < recipients.length; i += batchSize) {
            batches.push(recipients.slice(i, i + batchSize));
        }
        let successCount = 0;
        for (const batch of batches) {
            try {
                const promises = batch.map(email => this.sendEmail({
                    to: email,
                    subject,
                    html: content,
                }));
                const results = await Promise.allSettled(promises);
                successCount += results.filter(r => r.status === 'fulfilled' && r.value).length;
                // Add delay between batches
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            catch (error) {
                logger.error('Newsletter batch send error:', error);
            }
        }
        logger.info(`Newsletter sent to ${successCount}/${recipients.length} recipients`);
        return successCount > 0;
    }
    /**
     * Get email service status
     */
    static async getStatus() {
        try {
            await this.transporter.verify();
            return {
                connected: true,
                templates_loaded: this.templates.size,
            };
        }
        catch (error) {
            return {
                connected: false,
                templates_loaded: this.templates.size,
                last_error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    /**
     * Close email service
     */
    static async close() {
        if (this.transporter) {
            this.transporter.close();
            logger.info('Email service closed');
        }
    }
}
//# sourceMappingURL=EmailService.js.map