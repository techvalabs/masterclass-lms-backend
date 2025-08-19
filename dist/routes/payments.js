import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController.js';
import { MockPaymentController } from '../controllers/MockPaymentController.js';
import { authenticate } from '../middleware/auth.js';
import express from 'express';
const router = Router();
const paymentController = new PaymentController();
const mockPaymentController = new MockPaymentController();
// Stripe webhook (no auth needed, uses signature verification)
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), paymentController.handleStripeWebhook.bind(paymentController));
// Get payment configuration (public endpoint)
router.get('/config', (req, res) => {
    res.json({
        success: true,
        data: {
            stripePublicKey: process.env.STRIPE_PUBLIC_KEY || 'pk_test_example',
            currency: 'USD',
            supportedMethods: ['card', 'paypal'],
            environment: process.env.NODE_ENV || 'development'
        }
    });
});
// Protected routes
router.use(authenticate);
// Create checkout session
router.post('/checkout', paymentController.createCheckoutSession.bind(paymentController));
// Create subscription
router.post('/subscription', paymentController.createSubscription.bind(paymentController));
// Get payment history
router.get('/history', paymentController.getPaymentHistory.bind(paymentController));
// Mock payment routes (for testing without Stripe)
router.post('/mock-checkout', mockPaymentController.createMockCheckout.bind(mockPaymentController));
router.post('/enroll-free', mockPaymentController.enrollFree.bind(mockPaymentController));
router.get('/mock-status/:transactionId', mockPaymentController.getMockPaymentStatus.bind(mockPaymentController));
// Process mock payment (simplified endpoint for testing)
router.post('/process', paymentController.processMockPayment.bind(paymentController));
export default router;
//# sourceMappingURL=payments.js.map