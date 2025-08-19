interface VideoMetadata {
    duration: number;
    durationFormatted: string;
    fileSize: number;
    fileSizeFormatted: string;
    format: string;
    filename: string;
}
interface CoursePricingSuggestion {
    basePrice: number;
    recommendedPrice: number;
    minPrice: number;
    maxPrice: number;
    isFree: boolean;
    pricingFactors: {
        durationScore: number;
        contentDepthScore: number;
        marketRate: number;
    };
}
interface CourseAnalysis {
    totalDuration: number;
    totalDurationFormatted: string;
    totalVideos: number;
    averageLessonLength: number;
    modules: ModuleAnalysis[];
    pricingSuggestion: CoursePricingSuggestion;
    difficultyEstimate: 'beginner' | 'intermediate' | 'advanced';
}
interface ModuleAnalysis {
    moduleId: string;
    duration: number;
    videoCount: number;
    lessons: LessonAnalysis[];
}
interface LessonAnalysis {
    lessonId: string;
    duration: number;
    videoMetadata?: VideoMetadata;
}
export declare class VideoAnalyzer {
    /**
     * Extract metadata from a video file
     */
    static getVideoMetadata(videoPath: string): Promise<VideoMetadata>;
    /**
     * Analyze course content and calculate duration
     */
    static analyzeCourseContent(modules: Array<{
        id: string;
        lessons: Array<{
            id: string;
            videoPath?: string;
            estimatedDuration?: number;
        }>;
    }>): Promise<CourseAnalysis>;
    /**
     * Calculate smart pricing suggestion based on course content
     */
    static calculatePricingSuggestion(totalHours: number, totalVideos: number, moduleCount: number, difficulty: 'beginner' | 'intermediate' | 'advanced'): CoursePricingSuggestion;
    /**
     * Apply psychological pricing (ending in 9, 7, or 5)
     */
    private static applyPsychologicalPricing;
    /**
     * Estimate course difficulty based on content
     */
    private static estimateDifficulty;
    /**
     * Format duration in seconds to readable string
     */
    private static formatDuration;
    /**
     * Format hours to readable string
     */
    private static formatHours;
    /**
     * Format file size to readable string
     */
    private static formatFileSize;
    /**
     * Calculate optimal pricing tiers for the course
     */
    static generatePricingTiers(baseSuggestion: CoursePricingSuggestion): {
        basic: {
            price: number;
            features: string[];
        };
        standard: {
            price: number;
            features: string[];
        };
        premium: {
            price: number;
            features: string[];
        };
    };
}
export default VideoAnalyzer;
//# sourceMappingURL=videoAnalyzer.d.ts.map