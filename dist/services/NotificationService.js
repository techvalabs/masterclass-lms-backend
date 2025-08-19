import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';
class NotificationService {
    io = null;
    userSocketMap = new Map();
    initialize(httpServer) {
        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: [
                    'http://localhost:5173',
                    'http://localhost:5174',
                    'http://localhost:5175',
                    'http://localhost:5176',
                    'http://localhost:5177',
                    process.env.FRONTEND_URL || 'http://localhost:5173'
                ],
                credentials: true
            }
        });
        // Store io instance globally for health checks
        global.io = this.io;
        this.setupSocketAuthentication();
        this.setupSocketHandlers();
        this.createNotificationTables();
    }
    async createNotificationTables() {
        try {
            const pool = db.getPool();
            if (!pool) {
                console.warn('Database not connected, skipping notification tables creation');
                return;
            }
            // Create notifications table if it doesn't exist
            await pool.execute(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          type VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          metadata JSON,
          action_url VARCHAR(500),
          priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
          is_read BOOLEAN DEFAULT FALSE,
          read_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_user_notifications (user_id, is_read, created_at),
          INDEX idx_notification_type (type),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
            // Create notification preferences table
            await pool.execute(`
        CREATE TABLE IF NOT EXISTS notification_preferences (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL UNIQUE,
          email_notifications BOOLEAN DEFAULT TRUE,
          push_notifications BOOLEAN DEFAULT TRUE,
          sms_notifications BOOLEAN DEFAULT FALSE,
          course_updates BOOLEAN DEFAULT TRUE,
          promotional_emails BOOLEAN DEFAULT TRUE,
          forum_notifications BOOLEAN DEFAULT TRUE,
          assignment_reminders BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
            console.log('Notification tables created successfully');
        }
        catch (error) {
            console.error('Error creating notification tables:', error);
        }
    }
    setupSocketAuthentication() {
        if (!this.io)
            return;
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error('Authentication error'));
                }
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.data.userId = decoded.id;
                socket.data.userRole = decoded.role;
                next();
            }
            catch (err) {
                next(new Error('Authentication error'));
            }
        });
    }
    setupSocketHandlers() {
        if (!this.io)
            return;
        this.io.on('connection', (socket) => {
            const userId = socket.data.userId;
            console.log(`User ${userId} connected to notifications`);
            // Track user's socket connections
            if (!this.userSocketMap.has(userId)) {
                this.userSocketMap.set(userId, []);
            }
            this.userSocketMap.get(userId).push(socket.id);
            // Join user to their personal room
            socket.join(`user-${userId}`);
            // Join role-based rooms
            if (socket.data.userRole) {
                socket.join(`role-${socket.data.userRole}`);
            }
            // Send unread notifications count on connection
            this.sendUnreadCount(userId);
            // Handle marking notifications as read
            socket.on('mark-as-read', async (notificationId) => {
                await this.markAsRead(userId, notificationId);
            });
            // Handle marking all as read
            socket.on('mark-all-read', async () => {
                await this.markAllAsRead(userId);
            });
            // Handle fetching notifications
            socket.on('fetch-notifications', async (options) => {
                const notifications = await this.getUserNotifications(userId, options);
                socket.emit('notifications', notifications);
            });
            // Handle disconnect
            socket.on('disconnect', () => {
                console.log(`User ${userId} disconnected from notifications`);
                const userSockets = this.userSocketMap.get(userId);
                if (userSockets) {
                    const index = userSockets.indexOf(socket.id);
                    if (index > -1) {
                        userSockets.splice(index, 1);
                    }
                    if (userSockets.length === 0) {
                        this.userSocketMap.delete(userId);
                    }
                }
            });
        });
    }
    async sendNotification(data) {
        try {
            const pool = db.getPool();
            if (!pool) {
                console.warn('Database not connected, cannot send notification');
                return;
            }
            // Store notification in database
            const [result] = await pool.execute(`INSERT INTO notifications (user_id, type, title, message, metadata, action_url, priority)
         VALUES (?, ?, ?, ?, ?, ?, ?)`, [
                data.userId,
                data.type,
                data.title,
                data.message,
                JSON.stringify(data.metadata || {}),
                data.actionUrl || null,
                data.priority || 'medium'
            ]);
            const notificationId = result.insertId;
            // Send real-time notification if user is connected
            if (this.io) {
                const notification = {
                    id: notificationId,
                    ...data,
                    isRead: false,
                    createdAt: new Date()
                };
                this.io.to(`user-${data.userId}`).emit('new-notification', notification);
                // Update unread count
                this.sendUnreadCount(data.userId);
            }
            // Check user preferences and send email/SMS if enabled
            await this.sendExternalNotifications(data);
        }
        catch (error) {
            console.error('Error sending notification:', error);
        }
    }
    async sendBulkNotifications(userIds, notification) {
        const promises = userIds.map(userId => this.sendNotification({ ...notification, userId }));
        await Promise.all(promises);
    }
    async sendRoleNotification(role, notification) {
        try {
            const pool = db.getPool();
            if (!pool) {
                console.warn('Database not connected');
                return;
            }
            // Get all users with the specified role
            const [users] = await pool.execute(`SELECT u.id FROM users u 
         JOIN roles r ON u.role_id = r.id 
         WHERE r.name = ?`, [role]);
            const userIds = users.map(user => user.id);
            await this.sendBulkNotifications(userIds, notification);
            // Also emit to role room for real-time updates
            if (this.io) {
                this.io.to(`role-${role}`).emit('role-notification', {
                    ...notification,
                    createdAt: new Date()
                });
            }
        }
        catch (error) {
            console.error('Error sending role notification:', error);
        }
    }
    async sendUnreadCount(userId) {
        try {
            const pool = db.getPool();
            if (!pool)
                return;
            const [rows] = await pool.execute('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE', [userId]);
            const count = rows[0].count;
            if (this.io) {
                this.io.to(`user-${userId}`).emit('unread-count', count);
            }
        }
        catch (error) {
            console.error('Error sending unread count:', error);
        }
    }
    async getUserNotifications(userId, options = {}) {
        const limit = options.limit || 20;
        const offset = options.offset || 0;
        try {
            const pool = db.getPool();
            if (!pool)
                return [];
            const [notifications] = await pool.execute(`SELECT * FROM notifications 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT ? OFFSET ?`, [userId, limit, offset]);
            return notifications.map(n => ({
                ...n,
                metadata: typeof n.metadata === 'string' ? JSON.parse(n.metadata) : n.metadata
            }));
        }
        catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    }
    async markAsRead(userId, notificationId) {
        try {
            const pool = db.getPool();
            if (!pool)
                return;
            await pool.execute(`UPDATE notifications 
         SET is_read = TRUE, read_at = NOW() 
         WHERE id = ? AND user_id = ?`, [notificationId, userId]);
            this.sendUnreadCount(userId);
        }
        catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }
    async markAllAsRead(userId) {
        try {
            const pool = db.getPool();
            if (!pool)
                return;
            await pool.execute(`UPDATE notifications 
         SET is_read = TRUE, read_at = NOW() 
         WHERE user_id = ? AND is_read = FALSE`, [userId]);
            this.sendUnreadCount(userId);
        }
        catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }
    async sendExternalNotifications(data) {
        try {
            const pool = db.getPool();
            if (!pool)
                return;
            // Check user preferences
            const [prefs] = await pool.execute('SELECT * FROM notification_preferences WHERE user_id = ?', [data.userId]);
            if (prefs.length === 0) {
                // Create default preferences if not exist
                await pool.execute('INSERT INTO notification_preferences (user_id) VALUES (?)', [data.userId]);
                return;
            }
            const preferences = prefs[0];
            // Send email notification if enabled and high priority
            if (preferences.email_notifications &&
                (data.priority === 'high' || data.priority === 'urgent')) {
                // Email sending logic would go here
                console.log(`Would send email notification to user ${data.userId}`);
            }
            // Send SMS if enabled and urgent
            if (preferences.sms_notifications && data.priority === 'urgent') {
                // SMS sending logic would go here
                console.log(`Would send SMS notification to user ${data.userId}`);
            }
        }
        catch (error) {
            console.error('Error sending external notifications:', error);
        }
    }
    // Notification templates for common events
    async notifyCourseEnrollment(userId, courseId, courseTitle) {
        await this.sendNotification({
            userId,
            type: 'course_enrollment',
            title: 'Course Enrollment Successful',
            message: `You have been successfully enrolled in "${courseTitle}"`,
            metadata: { courseId },
            actionUrl: `/learn/course/${courseId}`,
            priority: 'medium'
        });
    }
    async notifyCourseCompletion(userId, courseId, courseTitle) {
        await this.sendNotification({
            userId,
            type: 'course_completion',
            title: 'Congratulations! Course Completed',
            message: `You have successfully completed "${courseTitle}". Your certificate is ready!`,
            metadata: { courseId },
            actionUrl: `/certificate/${courseId}`,
            priority: 'high'
        });
    }
    async notifyNewReview(instructorId, courseTitle, rating) {
        await this.sendNotification({
            userId: instructorId,
            type: 'new_review',
            title: 'New Course Review',
            message: `Your course "${courseTitle}" received a ${rating}-star review`,
            metadata: { rating },
            actionUrl: '/instructor/reviews',
            priority: 'medium'
        });
    }
    async notifyPaymentReceived(userId, amount, courseTitle) {
        await this.sendNotification({
            userId,
            type: 'payment_received',
            title: 'Payment Successful',
            message: `Payment of $${amount} for "${courseTitle}" has been processed successfully`,
            metadata: { amount },
            priority: 'high'
        });
    }
    async notifyAssignmentGraded(userId, assignmentTitle, grade) {
        await this.sendNotification({
            userId,
            type: 'assignment_graded',
            title: 'Assignment Graded',
            message: `Your assignment "${assignmentTitle}" has been graded: ${grade}`,
            metadata: { grade },
            actionUrl: '/student/assignments',
            priority: 'medium'
        });
    }
    async notifyInstructorAnnouncement(courseId, announcement) {
        const pool = db.getPool();
        if (!pool)
            return;
        // Get all enrolled students
        const [students] = await pool.execute('SELECT user_id FROM enrollments WHERE course_id = ?', [courseId]);
        const userIds = students.map(s => s.user_id);
        await this.sendBulkNotifications(userIds, {
            type: 'instructor_announcement',
            title: 'Course Announcement',
            message: announcement,
            metadata: { courseId },
            actionUrl: `/learn/course/${courseId}`,
            priority: 'medium'
        });
    }
}
export const notificationService = new NotificationService();
//# sourceMappingURL=NotificationService.js.map