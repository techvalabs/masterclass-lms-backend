import { Request, Response } from 'express';
import { BaseController } from './BaseController.js';
export declare class VideoUploadController extends BaseController {
    uploadLessonVideo(req: Request, res: Response): Promise<void>;
    private generateThumbnail;
    private processVideoQualities;
    private processVideo;
    private generateHLS;
    getVideoStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteVideo(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=VideoUploadController.d.ts.map