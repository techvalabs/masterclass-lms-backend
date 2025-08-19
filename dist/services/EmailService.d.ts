import { EmailOptions } from '@/types/index.js';
/**
 * Email Service
 * Handles all email communications using Nodemailer and Handlebars templates
 */
export declare class EmailService {
    private static transporter;
    private static templates;
    /**
     * Initialize email service
     */
    static initialize(): Promise<void>;
    /**
     * Load email templates
     */
    private static loadTemplates;
    /**
     * Send email using template
     */
    static sendEmail(options: EmailOptions): Promise<boolean>;
    /**
     * Send verification email
     */
    static sendVerificationEmail(email: string, name: string, token: string): Promise<boolean>;
    /**
     * Send password reset email
     */
    static sendPasswordResetEmail(email: string, name: string, token: string): Promise<boolean>;
    /**
     * Send password changed confirmation email
     */
    static sendPasswordChangedEmail(email: string, name: string): Promise<boolean>;
    /**
     * Send welcome email after email verification
     */
    static sendWelcomeEmail(email: string, name: string, role: string): Promise<boolean>;
    /**
     * Send course enrollment confirmation
     */
    static sendEnrollmentConfirmation(email: string, name: string, courseName: string, courseUrl: string): Promise<boolean>;
    /**
     * Send course completion certificate
     */
    static sendCertificate(email: string, name: string, courseName: string, certificateUrl: string): Promise<boolean>;
    /**
     * Send quiz completion notification
     */
    static sendQuizCompletion(email: string, name: string, quizName: string, score: number, passed: boolean): Promise<boolean>;
    /**
     * Send instructor application notification
     */
    static sendInstructorApplication(email: string, name: string, applicationId: string): Promise<boolean>;
    /**
     * Send newsletter/marketing emails
     */
    static sendNewsletter(recipients: string[], subject: string, content: string): Promise<boolean>;
    /**
     * Get email service status
     */
    static getStatus(): Promise<{
        connected: boolean;
        templates_loaded: number;
        last_error?: string;
    }>;
    /**
     * Close email service
     */
    static close(): Promise<void>;
}
//# sourceMappingURL=EmailService.d.ts.map