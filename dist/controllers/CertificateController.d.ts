import { Request, Response } from 'express';
import { BaseController } from './BaseController.js';
export declare class CertificateController extends BaseController {
    /**
     * Generate certificate for a completed course
     */
    generateCertificate(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Get certificate by course ID
     */
    getCertificateByCourse(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Get all certificates for a user
     */
    getUserCertificates(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Verify certificate by number
     */
    verifyCertificate(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Generate unique certificate number
     */
    private generateCertificateNumber;
    /**
     * Format certificate data
     */
    private formatCertificate;
}
export declare const certificateController: CertificateController;
//# sourceMappingURL=CertificateController.d.ts.map