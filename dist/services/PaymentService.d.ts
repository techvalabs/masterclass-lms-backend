import Stripe from 'stripe';
interface PaymentData {
    userId: number;
    courseId: number;
    amount: number;
    currency: string;
    paymentMethod: 'card' | 'paypal' | 'bank_transfer';
    metadata?: Record<string, any>;
}
interface Coupon {
    id: number;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    valid_from: Date;
    valid_until: Date;
    max_uses: number;
    used_count: number;
    is_active: boolean;
}
declare class PaymentService {
    constructor();
    private initializePaymentTables;
    createPaymentIntent(data: PaymentData): Promise<{
        clientSecret: string | null;
        transactionId: string;
        amount: any;
        currency: string;
    }>;
    confirmPayment(paymentIntentId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    processRefund(transactionId: string, amount?: number, reason?: string): Promise<{
        success: boolean;
        refund: Stripe.Response<Stripe.Refund>;
    }>;
    validateCoupon(code: string, courseId?: number): Promise<Coupon | null>;
    applyCoupon(transactionId: string, couponCode: string): Promise<{
        success: boolean;
        discountAmount: number;
        netAmount: number;
        coupon: Coupon;
    }>;
    private createEnrollment;
    private updateCourseStats;
    getPaymentHistory(userId: number, limit?: number, offset?: number): Promise<any>;
    getRevenueStats(instructorId?: number): Promise<any>;
}
export declare const paymentService: PaymentService;
export {};
//# sourceMappingURL=PaymentService.d.ts.map