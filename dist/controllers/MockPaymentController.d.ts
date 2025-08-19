import { Request, Response } from 'express';
import { BaseController } from './BaseController.js';
export declare class MockPaymentController extends BaseController {
    createMockCheckout(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getMockPaymentStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    enrollFree(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=MockPaymentController.d.ts.map