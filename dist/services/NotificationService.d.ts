import { Server as HttpServer } from 'http';
interface NotificationData {
    userId: number;
    type: 'course_enrollment' | 'course_completion' | 'new_review' | 'new_message' | 'assignment_graded' | 'course_update' | 'payment_received' | 'certificate_earned' | 'quiz_completed' | 'forum_reply' | 'instructor_announcement' | 'system_alert';
    title: string;
    message: string;
    metadata?: Record<string, any>;
    actionUrl?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
}
declare class NotificationService {
    private io;
    private userSocketMap;
    initialize(httpServer: HttpServer): void;
    private createNotificationTables;
    private setupSocketAuthentication;
    private setupSocketHandlers;
    sendNotification(data: NotificationData): Promise<void>;
    sendBulkNotifications(userIds: number[], notification: Omit<NotificationData, 'userId'>): Promise<void>;
    sendRoleNotification(role: string, notification: Omit<NotificationData, 'userId'>): Promise<void>;
    private sendUnreadCount;
    private getUserNotifications;
    private markAsRead;
    private markAllAsRead;
    private sendExternalNotifications;
    notifyCourseEnrollment(userId: number, courseId: number, courseTitle: string): Promise<void>;
    notifyCourseCompletion(userId: number, courseId: number, courseTitle: string): Promise<void>;
    notifyNewReview(instructorId: number, courseTitle: string, rating: number): Promise<void>;
    notifyPaymentReceived(userId: number, amount: number, courseTitle: string): Promise<void>;
    notifyAssignmentGraded(userId: number, assignmentTitle: string, grade: string): Promise<void>;
    notifyInstructorAnnouncement(courseId: number, announcement: string): Promise<void>;
}
export declare const notificationService: NotificationService;
export {};
//# sourceMappingURL=NotificationService.d.ts.map