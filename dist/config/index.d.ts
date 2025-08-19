import { AppConfig } from '@/types/index.js';
export declare const config: AppConfig;
export declare const paymentConfig: {
    stripe: {
        publishable_key: string;
        secret_key: string;
        webhook_secret: string;
        currency: string;
    };
    paypal: {
        client_id: string;
        client_secret: string;
        mode: string;
    };
};
export declare const storageConfig: {
    driver: string;
    local: {
        upload_path: string;
        public_url: string;
    };
    s3: {
        access_key_id: string;
        secret_access_key: string;
        region: string;
        bucket: string;
        public_url: string;
    };
};
export declare const videoConfig: {
    processing_enabled: boolean;
    ffmpeg_path: string;
    quality_levels: number[];
    output_formats: string[];
    thumbnail: {
        enabled: boolean;
        format: string;
        quality: number;
        width: number;
        height: number;
        time_offset: number;
    };
};
export declare const cacheConfig: {
    ttl: number;
    prefix: string;
    keys: {
        user_session: (userId: string) => string;
        course_data: (courseId: string) => string;
        enrollment_data: (userId: string, courseId: string) => string;
        progress_data: (userId: string, courseId: string) => string;
        quiz_results: (userId: string, quizId: string) => string;
        analytics: (type: string, timeframe: string) => string;
    };
};
export declare const certificateConfig: {
    enabled: boolean;
    template_path: string;
    storage_path: string;
    generation: {
        format: string;
        width: number;
        height: number;
        quality: number;
    };
    signature: {
        enabled: boolean;
        image_path: string;
        position: {
            x: number;
            y: number;
        };
    };
    verification: {
        base_url: string;
        qr_code: {
            enabled: boolean;
            size: number;
            position: {
                x: number;
                y: number;
            };
        };
    };
};
export declare const loggingConfig: {
    level: string;
    file_path: string;
    max_size: string;
    max_files: string;
    query_logging: boolean;
    performance_monitoring: boolean;
    exclude_paths: string[];
};
export declare const backupConfig: {
    enabled: boolean;
    schedule: string;
    retention_days: number;
    storage_path: string;
    mysql_dump_options: string[];
    compression: {
        enabled: boolean;
        algorithm: string;
        level: number;
    };
};
export declare const healthCheckConfig: {
    enabled: boolean;
    checks: {
        database: {
            timeout: number;
            critical: boolean;
        };
        redis: {
            timeout: number;
            critical: boolean;
        };
        storage: {
            timeout: number;
            critical: boolean;
        };
        external_services: {
            timeout: number;
            critical: boolean;
        };
    };
    thresholds: {
        response_time: number;
        memory_usage: number;
        cpu_usage: number;
        disk_usage: number;
    };
};
export declare function validateConfig(): boolean;
export declare const isDevelopment: boolean;
export declare const isProduction: boolean;
export declare const isTest: boolean;
export default config;
//# sourceMappingURL=index.d.ts.map