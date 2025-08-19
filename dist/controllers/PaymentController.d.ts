import { Request, Response } from 'express';
import { BaseController } from './BaseController.js';
export declare class PaymentController extends BaseController {
    processMockPayment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createCheckoutSession(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    handleStripeWebhook(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    private handleSuccessfulPayment;
    private handleFailedPayment;
    getPaymentHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createSubscription(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=PaymentController.d.ts.map