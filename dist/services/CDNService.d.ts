export declare class CDNService {
    private static instance;
    private s3Client;
    private cloudFrontClient;
    private config;
    private constructor();
    static getInstance(): CDNService;
    private initializeClients;
    uploadFile(filePath: string, key: string, contentType: string): Promise<string>;
    private uploadToS3;
    private uploadToCloudflare;
    private uploadToCloudflareStream;
    private uploadToBunny;
    private handleLocalStorage;
    getSignedUrl(key: string, expiresIn?: number): Promise<string>;
    deleteFile(key: string): Promise<void>;
    private deleteFromS3;
    private deleteFromCloudflare;
    private deleteFromBunny;
    private deleteFromLocal;
    invalidateCache(paths: string[]): Promise<void>;
    getCDNUrl(key: string): string;
    optimizeImage(imagePath: string, sizes?: number[]): Promise<string[]>;
    generateHLSManifest(videoKey: string, qualities: any[]): Promise<string>;
}
export declare const cdnService: CDNService;
//# sourceMappingURL=CDNService.d.ts.map