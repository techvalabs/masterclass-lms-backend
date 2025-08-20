import Stripe from 'stripe';
import { BaseController } from './BaseController.js';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-07-30.basil',
});
export class PaymentController extends BaseController {
    // Mock payment processing for testing
    async processMockPayment(req, res) {
        const db = this.getDatabase();
        try {
            const userId = req.userId;
            const { amount, currency, payment_method, billing_info, items, coupon_code, coupon_discount } = req.body;
            // Validate request
            if (!amount || !items || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid payment data'
                });
            }
            await db.query('START TRANSACTION');
            // Generate transaction ID
            const transactionId = `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            // Create payment transaction
            const [paymentResult] = await db.execute(`INSERT INTO payment_transactions (
          user_id, 
          amount, 
          currency, 
          status, 
          payment_method,
          stripe_session_id,
          metadata,
          created_at
        ) VALUES (?, ?, ?, 'completed', ?, ?, ?, NOW())`, [
                userId,
                amount,
                currency || 'USD',
                payment_method || 'mock',
                transactionId,
                JSON.stringify({
                    billing_info,
                    items,
                    coupon_code,
                    coupon_discount,
                    mock_payment: true
                })
            ]);
            const paymentId = paymentResult.insertId;
            // Create enrollments for each course
            for (const item of items) {
                // Check if already enrolled
                const [existingEnrollment] = await db.execute('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, item.course_id]);
                if (existingEnrollment.length === 0) {
                    // Create enrollment
                    const [enrollmentResult] = await db.execute(`INSERT INTO enrollments 
             (user_id, course_id, status, payment_status, enrolled_at, created_at) 
             VALUES (?, ?, 'active', 'paid', NOW(), NOW())`, [userId, item.course_id]);
                    // Create course progress
                    await db.execute(`INSERT INTO course_progress 
             (user_id, course_id, enrollment_id, progress_percentage, last_accessed_at, created_at) 
             VALUES (?, ?, ?, 0, NOW(), NOW())
             ON DUPLICATE KEY UPDATE updated_at = NOW()`, [userId, item.course_id, enrollmentResult.insertId]);
                    // Update course stats
                    await db.execute(`UPDATE courses 
             SET total_students = total_students + 1 
             WHERE id = ?`, [item.course_id]);
                }
            }
            await db.query('COMMIT');
            res.json({
                success: true,
                message: 'Mock payment processed successfully',
                transaction_id: transactionId,
                payment_id: paymentId
            });
        }
        catch (error) {
            await db.query('ROLLBACK');
            console.error('Mock payment processing error:', error);
            res.status(500).json({
                success: false,
                message: 'Payment processing failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Create checkout session for course purchase
    async createCheckoutSession(req, res) {
        try {
            const { courseId, successUrl, cancelUrl } = req.body;
            const userId = req.userId;
            // Fetch course details
            const [courses] = await this.getDatabase().execute('SELECT * FROM courses WHERE id = ?', [courseId]);
            if (courses.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Course not found'
                });
            }
            const course = courses[0];
            // Check if already enrolled
            const [enrollments] = await this.getDatabase().execute('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, courseId]);
            if (enrollments.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Already enrolled in this course'
                });
            }
            // Create Stripe checkout session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: course.currency?.toLowerCase() || 'usd',
                            product_data: {
                                name: course.title,
                                description: course.description?.substring(0, 500),
                                images: course.thumbnail ? [`${process.env.BACKEND_URL}${course.thumbnail}`] : [],
                            },
                            unit_amount: Math.round((course.discount_price || course.price) * 100),
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: successUrl || `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel`,
                metadata: {
                    userId: userId.toString(),
                    courseId: courseId.toString(),
                },
                customer_email: req.userEmail,
            });
            // Store payment intent
            await this.getDatabase().execute(`INSERT INTO payment_transactions 
         (user_id, course_id, amount, currency, status, payment_method, stripe_session_id, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`, [
                userId,
                courseId,
                course.discount_price || course.price,
                course.currency || 'USD',
                'pending',
                'stripe',
                session.id
            ]);
            res.json({
                success: true,
                data: {
                    checkoutUrl: session.url,
                    sessionId: session.id
                }
            });
        }
        catch (error) {
            console.error('Checkout session error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create checkout session'
            });
        }
    }
    // Stripe webhook handler
    async handleStripeWebhook(req, res) {
        const sig = req.headers['stripe-signature'];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        }
        catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed':
                await this.handleSuccessfulPayment(event.data.object);
                break;
            case 'payment_intent.payment_failed':
                await this.handleFailedPayment(event.data.object);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        res.json({ received: true });
    }
    // Handle successful payment
    async handleSuccessfulPayment(session) {
        const db = this.getDatabase();
        try {
            await db.query('START TRANSACTION');
            const { userId, courseId } = session.metadata;
            // Update transaction status
            await db.execute(`UPDATE payment_transactions 
         SET status = 'completed', 
             stripe_payment_intent = ?,
             completed_at = NOW() 
         WHERE stripe_session_id = ?`, [session.payment_intent, session.id]);
            // Create enrollment
            await db.execute(`INSERT INTO enrollments 
         (user_id, course_id, status, payment_status, enrolled_at, created_at) 
         VALUES (?, ?, 'active', 'paid', NOW(), NOW())`, [userId, courseId]);
            // Update course stats
            await db.execute(`UPDATE courses 
         SET total_students = total_students + 1 
         WHERE id = ?`, [courseId]);
            // Create initial progress record
            await db.execute(`INSERT INTO course_progress 
         (user_id, course_id, progress_percentage, last_accessed_at, created_at) 
         VALUES (?, ?, 0, NOW(), NOW())`, [userId, courseId]);
            await db.query('COMMIT');
            // TODO: Send enrollment confirmation email
            console.log(`Enrollment successful: User ${userId} enrolled in Course ${courseId}`);
        }
        catch (error) {
            await db.query('ROLLBACK');
            console.error('Failed to process successful payment:', error);
            throw error;
        }
    }
    // Handle failed payment
    async handleFailedPayment(paymentIntent) {
        try {
            await this.getDatabase().execute(`UPDATE payment_transactions 
         SET status = 'failed', 
             failure_reason = ?,
             updated_at = NOW() 
         WHERE stripe_payment_intent = ?`, [paymentIntent.last_payment_error?.message || 'Unknown error', paymentIntent.id]);
        }
        catch (error) {
            console.error('Failed to update failed payment:', error);
        }
    }
    // Get user's payment history
    async getPaymentHistory(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            const { page = 1, limit = 10 } = req.query;
            const offset = (Number(page) - 1) * Number(limit);
            const limitNum = Math.min(Math.max(1, Number(limit)), 50);
            const [transactions] = await this.getDatabase().query(`SELECT 
          pt.*,
          c.title as course_title,
          c.thumbnail as course_thumbnail
         FROM payment_transactions pt
         JOIN courses c ON pt.course_id = c.id
         WHERE pt.user_id = ?
         ORDER BY pt.created_at DESC
         LIMIT ${limitNum} OFFSET ${offset}`, [userId]);
            const [countResult] = await this.getDatabase().execute('SELECT COUNT(*) as total FROM payment_transactions WHERE user_id = ?', [userId]);
            res.json({
                success: true,
                data: {
                    transactions,
                    pagination: {
                        page: Number(page),
                        limit: limitNum,
                        total: countResult[0].total,
                        pages: Math.ceil(countResult[0].total / limitNum)
                    }
                }
            });
        }
        catch (error) {
            console.error('Get payment history error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch payment history'
            });
        }
    }
    // Create subscription (for future subscription model)
    async createSubscription(req, res) {
        try {
            const { priceId, successUrl, cancelUrl } = req.body;
            const userId = req.userId;
            const userEmail = req.userEmail;
            // Create or get Stripe customer
            let customerId;
            const [users] = await this.getDatabase().execute('SELECT stripe_customer_id FROM users WHERE id = ?', [userId]);
            if (users[0].stripe_customer_id) {
                customerId = users[0].stripe_customer_id;
            }
            else {
                const customer = await stripe.customers.create({
                    email: userEmail,
                    metadata: {
                        userId: userId.toString()
                    }
                });
                customerId = customer.id;
                await this.getDatabase().execute('UPDATE users SET stripe_customer_id = ? WHERE id = ?', [customerId, userId]);
            }
            // Create checkout session for subscription
            const session = await stripe.checkout.sessions.create({
                customer: customerId,
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                success_url: successUrl || `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/subscription/cancel`,
                metadata: {
                    userId: userId.toString()
                }
            });
            res.json({
                success: true,
                data: {
                    checkoutUrl: session.url,
                    sessionId: session.id
                }
            });
        }
        catch (error) {
            console.error('Create subscription error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create subscription'
            });
        }
    }
}
//# sourceMappingURL=PaymentController.js.map