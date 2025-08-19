export declare const uploadToCloudinary: {
    courseThumbnail: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    courseVideo: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    courseMaterials: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    userAvatar: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    generic: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
};
export declare class CloudinaryService {
    static deleteFile(publicId: string, resourceType?: string): Promise<void>;
    static getOptimizedUrl(publicId: string, options?: any): string;
    static uploadFromUrl(url: string, folder: string): Promise<any>;
    static getSignedUrl(publicId: string, expiresIn?: number): string;
    static getVideoThumbnail(publicId: string): string;
    static bulkDelete(publicIds: string[], resourceType?: string): Promise<void>;
    static isConfigured(): boolean;
    static getUploadPreset(): string;
}
//# sourceMappingURL=CloudinaryService.d.ts.map