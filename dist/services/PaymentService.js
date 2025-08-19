import Stripe from 'stripe';
import pool from '../config/database.js';
import { notificationService } from './NotificationService.js';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia'
});
class PaymentService {
    constructor() {
        this.initializePaymentTables();
    }
    async initializePaymentTables() {
        try {
            // Enhanced payment_transactions table
            await pool.execute(`
        CREATE TABLE IF NOT EXISTS payment_transactions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          course_id INT,
          bundle_id INT,
          transaction_id VARCHAR(255) NOT NULL UNIQUE,
          stripe_payment_intent_id VARCHAR(255),
          stripe_charge_id VARCHAR(255),
          amount DECIMAL(10,2) NOT NULL,
          currency VARCHAR(3) DEFAULT 'USD',
          payment_method VARCHAR(50) NOT NULL,
          payment_status ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
          description TEXT,
          metadata JSON,
          coupon_code VARCHAR(50),
          discount_amount DECIMAL(10,2) DEFAULT 0,
          tax_amount DECIMAL(10,2) DEFAULT 0,
          net_amount DECIMAL(10,2),
          refund_amount DECIMAL(10,2) DEFAULT 0,
          refund_reason TEXT,
          refunded_at TIMESTAMP NULL,
          failed_reason TEXT,
          payment_gateway VARCHAR(50) DEFAULT 'stripe',
          gateway_response JSON,
          ip_address VARCHAR(45),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          completed_at TIMESTAMP NULL,
          INDEX idx_user_payments (user_id),
          INDEX idx_course_payments (course_id),
          INDEX idx_payment_status (payment_status),
          INDEX idx_transaction_id (transaction_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
          FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
        )
      `);
            // Coupons table
            await pool.execute(`
        CREATE TABLE IF NOT EXISTS coupons (
          id INT AUTO_INCREMENT PRIMARY KEY,
          code VARCHAR(50) NOT NULL UNIQUE,
          description TEXT,
          discount_type ENUM('percentage', 'fixed') NOT NULL,
          discount_value DECIMAL(10,2) NOT NULL,
          min_purchase_amount DECIMAL(10,2) DEFAULT 0,
          max_discount_amount DECIMAL(10,2),
          valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          valid_until TIMESTAMP NULL,
          max_uses INT DEFAULT NULL,
          used_count INT DEFAULT 0,
          course_id INT,
          category_id INT,
          is_active BOOLEAN DEFAULT TRUE,
          created_by INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_coupon_code (code),
          INDEX idx_coupon_active (is_active, valid_from, valid_until),
          FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
        )
      `);
            // Coupon usage tracking
            await pool.execute(`
        CREATE TABLE IF NOT EXISTS coupon_usage (
          id INT AUTO_INCREMENT PRIMARY KEY,
          coupon_id INT NOT NULL,
          user_id INT NOT NULL,
          transaction_id INT NOT NULL,
          discount_applied DECIMAL(10,2) NOT NULL,
          used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_coupon_transaction (coupon_id, transaction_id),
          FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id) ON DELETE CASCADE
        )
      `);
            // Subscription plans
            await pool.execute(`
        CREATE TABLE IF NOT EXISTS subscription_plans (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          currency VARCHAR(3) DEFAULT 'USD',
          billing_period ENUM('monthly', 'quarterly', 'yearly') NOT NULL,
          features JSON,
          max_courses INT,
          stripe_price_id VARCHAR(255),
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
            // User subscriptions
            await pool.execute(`
        CREATE TABLE IF NOT EXISTS user_subscriptions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          plan_id INT NOT NULL,
          stripe_subscription_id VARCHAR(255),
          status ENUM('active', 'cancelled', 'expired', 'past_due', 'trialing') NOT NULL,
          current_period_start TIMESTAMP NOT NULL,
          current_period_end TIMESTAMP NOT NULL,
          cancelled_at TIMESTAMP NULL,
          cancel_reason TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_user_subscription (user_id, status),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT
        )
      `);
            console.log('Payment tables initialized successfully');
        }
        catch (error) {
            console.error('Error initializing payment tables:', error);
        }
    }
    async createPaymentIntent(data) {
        try {
            // Get course details
            const [courses] = await pool.execute('SELECT title, price, discount_price FROM courses WHERE id = ?', [data.courseId]);
            if (courses.length === 0) {
                throw new Error('Course not found');
            }
            const course = courses[0];
            const finalAmount = course.discount_price || course.price;
            // Create Stripe payment intent
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(finalAmount * 100), // Stripe expects amount in cents
                currency: data.currency.toLowerCase(),
                metadata: {
                    userId: data.userId.toString(),
                    courseId: data.courseId.toString(),
                    courseTitle: course.title
                },
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            // Create transaction record
            const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            await pool.execute(`INSERT INTO payment_transactions 
         (user_id, course_id, transaction_id, stripe_payment_intent_id, amount, currency, payment_method, payment_status, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`, [
                data.userId,
                data.courseId,
                transactionId,
                paymentIntent.id,
                finalAmount,
                data.currency,
                data.paymentMethod,
                `Payment for course: ${course.title}`
            ]);
            return {
                clientSecret: paymentIntent.client_secret,
                transactionId,
                amount: finalAmount,
                currency: data.currency
            };
        }
        catch (error) {
            console.error('Error creating payment intent:', error);
            throw error;
        }
    }
    async confirmPayment(paymentIntentId) {
        try {
            // Retrieve payment intent from Stripe
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            if (paymentIntent.status === 'succeeded') {
                // Update transaction status
                const [result] = await pool.execute(`UPDATE payment_transactions 
           SET payment_status = 'completed',
               completed_at = NOW(),
               stripe_charge_id = ?,
               gateway_response = ?
           WHERE stripe_payment_intent_id = ?`, [
                    paymentIntent.latest_charge,
                    JSON.stringify(paymentIntent),
                    paymentIntentId
                ]);
                // Get transaction details
                const [transactions] = await pool.execute(`SELECT pt.*, c.title as course_title
           FROM payment_transactions pt
           JOIN courses c ON pt.course_id = c.id
           WHERE pt.stripe_payment_intent_id = ?`, [paymentIntentId]);
                if (transactions.length > 0) {
                    const transaction = transactions[0];
                    // Create enrollment
                    await this.createEnrollment(transaction.user_id, transaction.course_id);
                    // Send notification
                    await notificationService.notifyPaymentReceived(transaction.user_id, transaction.amount, transaction.course_title);
                    // Update course statistics
                    await this.updateCourseStats(transaction.course_id);
                }
                return { success: true, message: 'Payment confirmed successfully' };
            }
            else {
                return { success: false, message: 'Payment not yet confirmed' };
            }
        }
        catch (error) {
            console.error('Error confirming payment:', error);
            throw error;
        }
    }
    async processRefund(transactionId, amount, reason) {
        try {
            // Get transaction details
            const [transactions] = await pool.execute('SELECT * FROM payment_transactions WHERE transaction_id = ?', [transactionId]);
            if (transactions.length === 0) {
                throw new Error('Transaction not found');
            }
            const transaction = transactions[0];
            if (transaction.payment_status !== 'completed') {
                throw new Error('Only completed transactions can be refunded');
            }
            const refundAmount = amount || transaction.amount;
            // Create Stripe refund
            const refund = await stripe.refunds.create({
                payment_intent: transaction.stripe_payment_intent_id,
                amount: Math.round(refundAmount * 100),
                reason: 'requested_by_customer',
                metadata: {
                    transactionId,
                    reason: reason || 'Customer requested refund'
                }
            });
            // Update transaction record
            await pool.execute(`UPDATE payment_transactions 
         SET payment_status = 'refunded',
             refund_amount = ?,
             refund_reason = ?,
             refunded_at = NOW()
         WHERE transaction_id = ?`, [refundAmount, reason || 'Customer requested', transactionId]);
            // Remove enrollment if full refund
            if (refundAmount === transaction.amount) {
                await pool.execute('DELETE FROM enrollments WHERE user_id = ? AND course_id = ?', [transaction.user_id, transaction.course_id]);
            }
            return { success: true, refund };
        }
        catch (error) {
            console.error('Error processing refund:', error);
            throw error;
        }
    }
    async validateCoupon(code, courseId) {
        try {
            let query = `
        SELECT * FROM coupons 
        WHERE code = ? 
          AND is_active = TRUE 
          AND (valid_from <= NOW() OR valid_from IS NULL)
          AND (valid_until >= NOW() OR valid_until IS NULL)
          AND (max_uses IS NULL OR used_count < max_uses)
      `;
            const params = [code];
            if (courseId) {
                query += ' AND (course_id = ? OR course_id IS NULL)';
                params.push(courseId);
            }
            const [coupons] = await pool.execute(query, params);
            if (coupons.length === 0) {
                return null;
            }
            return coupons[0];
        }
        catch (error) {
            console.error('Error validating coupon:', error);
            return null;
        }
    }
    async applyCoupon(transactionId, couponCode) {
        try {
            const coupon = await this.validateCoupon(couponCode);
            if (!coupon) {
                throw new Error('Invalid or expired coupon');
            }
            // Get transaction details
            const [transactions] = await pool.execute('SELECT * FROM payment_transactions WHERE transaction_id = ?', [transactionId]);
            if (transactions.length === 0) {
                throw new Error('Transaction not found');
            }
            const transaction = transactions[0];
            // Calculate discount
            let discountAmount = 0;
            if (coupon.discount_type === 'percentage') {
                discountAmount = (transaction.amount * coupon.discount_value) / 100;
                if (coupon.max_discount_amount) {
                    discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
                }
            }
            else {
                discountAmount = Math.min(coupon.discount_value, transaction.amount);
            }
            const netAmount = transaction.amount - discountAmount;
            // Update transaction
            await pool.execute(`UPDATE payment_transactions 
         SET coupon_code = ?,
             discount_amount = ?,
             net_amount = ?
         WHERE transaction_id = ?`, [couponCode, discountAmount, netAmount, transactionId]);
            // Increment coupon usage
            await pool.execute('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [coupon.id]);
            return {
                success: true,
                discountAmount,
                netAmount,
                coupon
            };
        }
        catch (error) {
            console.error('Error applying coupon:', error);
            throw error;
        }
    }
    async createEnrollment(userId, courseId) {
        try {
            // Check if already enrolled
            const [existing] = await pool.execute('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, courseId]);
            if (existing.length > 0) {
                return existing[0].id;
            }
            // Create enrollment
            const [result] = await pool.execute(`INSERT INTO enrollments (user_id, course_id, enrolled_at, status)
         VALUES (?, ?, NOW(), 'active')`, [userId, courseId]);
            // Create course progress entry
            await pool.execute(`INSERT INTO course_progress (user_id, course_id, enrollment_id)
         VALUES (?, ?, ?)`, [userId, courseId, result.insertId]);
            // Send enrollment notification
            const [courses] = await pool.execute('SELECT title FROM courses WHERE id = ?', [courseId]);
            if (courses.length > 0) {
                await notificationService.notifyCourseEnrollment(userId, courseId, courses[0].title);
            }
            return result.insertId;
        }
        catch (error) {
            console.error('Error creating enrollment:', error);
            throw error;
        }
    }
    async updateCourseStats(courseId) {
        try {
            // Update total students count
            await pool.execute(`UPDATE courses 
         SET total_students = (
           SELECT COUNT(*) FROM enrollments WHERE course_id = ?
         )
         WHERE id = ?`, [courseId, courseId]);
        }
        catch (error) {
            console.error('Error updating course stats:', error);
        }
    }
    async getPaymentHistory(userId, limit = 10, offset = 0) {
        try {
            const [transactions] = await pool.execute(`SELECT pt.*, c.title as course_title, c.thumbnail
         FROM payment_transactions pt
         LEFT JOIN courses c ON pt.course_id = c.id
         WHERE pt.user_id = ?
         ORDER BY pt.created_at DESC
         LIMIT ? OFFSET ?`, [userId, limit, offset]);
            return transactions;
        }
        catch (error) {
            console.error('Error fetching payment history:', error);
            throw error;
        }
    }
    async getRevenueStats(instructorId) {
        try {
            let query = `
        SELECT 
          COUNT(*) as total_transactions,
          SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END) as total_revenue,
          SUM(CASE WHEN payment_status = 'refunded' THEN refund_amount ELSE 0 END) as total_refunds,
          COUNT(DISTINCT user_id) as unique_customers,
          AVG(CASE WHEN payment_status = 'completed' THEN amount ELSE NULL END) as average_transaction,
          DATE_FORMAT(created_at, '%Y-%m') as month,
          SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END) as monthly_revenue
        FROM payment_transactions pt
      `;
            const params = [];
            if (instructorId) {
                query += ` JOIN courses c ON pt.course_id = c.id
                   WHERE c.instructor_id = ?`;
                params.push(instructorId);
            }
            query += ` GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                 ORDER BY month DESC`;
            const [stats] = await pool.execute(query, params);
            return stats;
        }
        catch (error) {
            console.error('Error fetching revenue stats:', error);
            throw error;
        }
    }
}
export const paymentService = new PaymentService();
//# sourceMappingURL=PaymentService.js.map