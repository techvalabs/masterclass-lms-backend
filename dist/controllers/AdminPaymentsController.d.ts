import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
interface AdminPaymentsRequest extends Request {
    user: {
        id: number;
        email: string;
        name: string;
        role: string;
        roleId: number;
        permissions: string[];
        isVerified: boolean;
        isActive: boolean;
    };
}
export declare class AdminPaymentsController {
    private db;
    constructor(database: mysql.Pool | null);
    private checkDatabaseConnection;
    /**
     * Get all transactions with filters and pagination
     * GET /api/admin/payments/transactions
     */
    getTransactions: (req: AdminPaymentsRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get all refunds with filters and pagination
     * GET /api/admin/payments/refunds
     */
    getRefunds: (req: AdminPaymentsRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Process a refund
     * POST /api/admin/payments/refund
     */
    processRefund: (req: AdminPaymentsRequest, res: Response) => Promise<void>;
    /**
     * Get all coupons with filters and pagination
     * GET /api/admin/payments/coupons
     */
    getCoupons: (req: AdminPaymentsRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Create new coupon
     * POST /api/admin/payments/coupons
     */
    createCoupon: (req: AdminPaymentsRequest, res: Response) => Promise<void>;
    /**
     * Update coupon
     * PUT /api/admin/payments/coupons/:id
     */
    updateCoupon: (req: AdminPaymentsRequest, res: Response) => Promise<void>;
    /**
     * Delete coupon
     * DELETE /api/admin/payments/coupons/:id
     */
    deleteCoupon: (req: AdminPaymentsRequest, res: Response) => Promise<void>;
    private getCouponStatus;
}
export default AdminPaymentsController;
//# sourceMappingURL=AdminPaymentsController.d.ts.map