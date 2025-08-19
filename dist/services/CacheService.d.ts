export declare class CacheService {
    private static instance;
    private client;
    private isConnected;
    private readonly defaultTTL;
    private constructor();
    static getInstance(): CacheService;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
    flush(): Promise<void>;
    getCourse(courseId: number): Promise<any | null>;
    setCourse(courseId: number, courseData: any, ttl?: number): Promise<void>;
    invalidateCourse(courseId: number): Promise<void>;
    getUser(userId: number): Promise<any | null>;
    setUser(userId: number, userData: any, ttl?: number): Promise<void>;
    invalidateUser(userId: number): Promise<void>;
    getEnrollments(userId: number): Promise<any | null>;
    setEnrollments(userId: number, enrollments: any, ttl?: number): Promise<void>;
    getProgress(userId: number, courseId: number): Promise<any | null>;
    setProgress(userId: number, courseId: number, progress: any, ttl?: number): Promise<void>;
    getDashboardStats(userId: number): Promise<any | null>;
    setDashboardStats(userId: number, stats: any, ttl?: number): Promise<void>;
    getAnalytics(key: string): Promise<any | null>;
    setAnalytics(key: string, data: any, ttl?: number): Promise<void>;
    getSession(sessionId: string): Promise<any | null>;
    setSession(sessionId: string, sessionData: any, ttl?: number): Promise<void>;
    deleteSession(sessionId: string): Promise<void>;
    incrementRateLimit(key: string, window?: number): Promise<number>;
    updateLeaderboard(leaderboardKey: string, userId: number, score: number): Promise<void>;
    getLeaderboard(leaderboardKey: string, limit?: number): Promise<any[]>;
    warmCache(): Promise<void>;
    healthCheck(): Promise<boolean>;
}
export declare const cacheService: CacheService;
//# sourceMappingURL=CacheService.d.ts.map