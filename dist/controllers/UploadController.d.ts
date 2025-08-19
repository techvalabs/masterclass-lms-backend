import { Request, Response } from 'express';
export declare class UploadController {
    uploadImage: (req: Request, res: Response) => Promise<void>;
    uploadMultipleImages: (req: Request, res: Response) => Promise<void>;
    uploadVideo: (req: Request, res: Response) => Promise<void>;
    uploadDocument: (req: Request, res: Response) => Promise<void>;
    uploadMultipleDocuments: (req: Request, res: Response) => Promise<void>;
    uploadAudio: (req: Request, res: Response) => Promise<void>;
    uploadFile: (req: Request, res: Response) => Promise<void>;
    getFileInfo: (req: Request, res: Response) => Promise<void>;
    deleteFile: (req: Request, res: Response) => Promise<void>;
    processVideo: (req: Request, res: Response) => Promise<void>;
    getVideoProcessingStatus: (req: Request, res: Response) => Promise<void>;
    generateVideoThumbnail: (req: Request, res: Response) => Promise<void>;
    initChunkedUpload: (req: Request, res: Response) => Promise<void>;
    uploadChunk: (req: Request, res: Response) => Promise<void>;
    completeChunkedUpload: (req: Request, res: Response) => Promise<void>;
    cancelChunkedUpload: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=UploadController.d.ts.map