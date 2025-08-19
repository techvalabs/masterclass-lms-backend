import { Request, Response } from 'express';
import { BaseController } from './BaseController.js';
export declare class TestController extends BaseController {
    checkDatabaseTable(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getSystemStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const testController: TestController;
//# sourceMappingURL=TestController.d.ts.map