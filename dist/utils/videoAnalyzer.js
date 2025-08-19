import { getVideoDurationInSeconds } from 'get-video-duration';
import path from 'path';
import fs from 'fs';
export class VideoAnalyzer {
    /**
     * Extract metadata from a video file
     */
    static async getVideoMetadata(videoPath) {
        try {
            // Get video duration
            const duration = await getVideoDurationInSeconds(videoPath);
            // Get file stats
            const stats = fs.statSync(videoPath);
            const fileSize = stats.size;
            // Get file format
            const format = path.extname(videoPath).substring(1).toUpperCase();
            const filename = path.basename(videoPath);
            return {
                duration,
                durationFormatted: this.formatDuration(duration),
                fileSize,
                fileSizeFormatted: this.formatFileSize(fileSize),
                format,
                filename
            };
        }
        catch (error) {
            console.error('Error extracting video metadata:', error);
            throw new Error('Failed to extract video metadata');
        }
    }
    /**
     * Analyze course content and calculate duration
     */
    static async analyzeCourseContent(modules) {
        let totalDuration = 0; // in seconds
        let totalVideos = 0;
        const moduleAnalyses = [];
        // Process each module
        for (const module of modules) {
            let moduleDuration = 0;
            const lessonAnalyses = [];
            // Process each lesson
            for (const lesson of module.lessons) {
                let lessonDuration = 0;
                let videoMetadata;
                if (lesson.videoPath && fs.existsSync(lesson.videoPath)) {
                    try {
                        videoMetadata = await this.getVideoMetadata(lesson.videoPath);
                        lessonDuration = videoMetadata.duration;
                        totalVideos++;
                    }
                    catch (error) {
                        // Fallback to estimated duration if video analysis fails
                        lessonDuration = (lesson.estimatedDuration || 10) * 60; // Convert minutes to seconds
                    }
                }
                else if (lesson.estimatedDuration) {
                    lessonDuration = lesson.estimatedDuration * 60; // Convert minutes to seconds
                }
                else {
                    // Default duration if nothing is provided
                    lessonDuration = 10 * 60; // 10 minutes default
                }
                moduleDuration += lessonDuration;
                lessonAnalyses.push({
                    lessonId: lesson.id,
                    duration: lessonDuration / 60, // Convert to minutes for output
                    videoMetadata
                });
            }
            totalDuration += moduleDuration;
            moduleAnalyses.push({
                moduleId: module.id,
                duration: moduleDuration / 60, // Convert to minutes
                videoCount: module.lessons.filter(l => l.videoPath).length,
                lessons: lessonAnalyses
            });
        }
        // Calculate statistics
        const totalHours = totalDuration / 3600;
        const averageLessonLength = totalVideos > 0 ? (totalDuration / totalVideos) / 60 : 0;
        // Estimate difficulty based on course length and complexity
        const difficultyEstimate = this.estimateDifficulty(totalHours, moduleAnalyses.length);
        // Generate pricing suggestion
        const pricingSuggestion = this.calculatePricingSuggestion(totalHours, totalVideos, moduleAnalyses.length, difficultyEstimate);
        return {
            totalDuration: totalHours,
            totalDurationFormatted: this.formatHours(totalHours),
            totalVideos,
            averageLessonLength,
            modules: moduleAnalyses,
            pricingSuggestion,
            difficultyEstimate
        };
    }
    /**
     * Calculate smart pricing suggestion based on course content
     */
    static calculatePricingSuggestion(totalHours, totalVideos, moduleCount, difficulty) {
        // Base pricing factors
        const PRICE_PER_HOUR_BASE = 10; // $10 per hour of content
        const PRICE_PER_VIDEO = 2; // $2 per video
        const MODULE_COMPLEXITY_BONUS = 5; // $5 per module
        // Difficulty multipliers
        const difficultyMultipliers = {
            beginner: 0.8,
            intermediate: 1.0,
            advanced: 1.3
        };
        // Market rate adjustments for real estate courses
        const REAL_ESTATE_MARKET_PREMIUM = 1.2; // 20% premium for real estate content
        // Calculate base price
        let basePrice = 0;
        // Duration-based pricing (main factor)
        const durationScore = totalHours * PRICE_PER_HOUR_BASE;
        // Content depth score (number of videos and modules)
        const contentDepthScore = (totalVideos * PRICE_PER_VIDEO) + (moduleCount * MODULE_COMPLEXITY_BONUS);
        // Apply difficulty multiplier
        const difficultyMultiplier = difficultyMultipliers[difficulty];
        // Calculate base price
        basePrice = (durationScore + contentDepthScore) * difficultyMultiplier;
        // Apply market premium
        const marketRate = basePrice * REAL_ESTATE_MARKET_PREMIUM;
        // Round to nearest $5 or $9 (psychological pricing)
        const recommendedPrice = this.applyPsychologicalPricing(marketRate);
        // Calculate price range
        const minPrice = Math.max(0, recommendedPrice * 0.7); // 30% discount minimum
        const maxPrice = recommendedPrice * 1.3; // 30% premium maximum
        // Determine if course should be free (very short courses)
        const isFree = totalHours < 0.5 || totalVideos < 3;
        return {
            basePrice: isFree ? 0 : Math.round(basePrice),
            recommendedPrice: isFree ? 0 : recommendedPrice,
            minPrice: isFree ? 0 : Math.round(minPrice),
            maxPrice: isFree ? 0 : Math.round(maxPrice),
            isFree,
            pricingFactors: {
                durationScore,
                contentDepthScore,
                marketRate
            }
        };
    }
    /**
     * Apply psychological pricing (ending in 9, 7, or 5)
     */
    static applyPsychologicalPricing(price) {
        if (price === 0)
            return 0;
        const rounded = Math.round(price);
        if (rounded < 20) {
            return Math.min(rounded, 19); // Small prices cap at $19
        }
        else if (rounded < 50) {
            // Round to nearest $5 and subtract $1
            return Math.round(rounded / 5) * 5 - 0.01;
        }
        else if (rounded < 100) {
            // Round to nearest $10 and end in 9
            return Math.round(rounded / 10) * 10 - 0.01;
        }
        else {
            // Round to nearest $10 and end in 7 or 9
            const base = Math.round(rounded / 10) * 10;
            return rounded > base ? base + 9 : base - 3;
        }
    }
    /**
     * Estimate course difficulty based on content
     */
    static estimateDifficulty(totalHours, moduleCount) {
        // Simple heuristic based on course length and complexity
        if (totalHours < 3 && moduleCount <= 3) {
            return 'beginner';
        }
        else if (totalHours < 10 && moduleCount <= 8) {
            return 'intermediate';
        }
        else {
            return 'advanced';
        }
    }
    /**
     * Format duration in seconds to readable string
     */
    static formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        }
        else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        }
        else {
            return `${secs}s`;
        }
    }
    /**
     * Format hours to readable string
     */
    static formatHours(hours) {
        if (hours < 1) {
            const minutes = Math.round(hours * 60);
            return `${minutes} minutes`;
        }
        else {
            const wholeHours = Math.floor(hours);
            const minutes = Math.round((hours - wholeHours) * 60);
            if (minutes > 0) {
                return `${wholeHours} hours ${minutes} minutes`;
            }
            else {
                return `${wholeHours} hours`;
            }
        }
    }
    /**
     * Format file size to readable string
     */
    static formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0)
            return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
    /**
     * Calculate optimal pricing tiers for the course
     */
    static generatePricingTiers(baseSuggestion) {
        const { recommendedPrice, isFree } = baseSuggestion;
        if (isFree) {
            return {
                basic: { price: 0, features: ['Full course access', 'Lifetime access'] },
                standard: { price: 0, features: ['Full course access', 'Lifetime access'] },
                premium: { price: 0, features: ['Full course access', 'Lifetime access'] }
            };
        }
        return {
            basic: {
                price: Math.round(recommendedPrice * 0.7),
                features: [
                    'Course videos',
                    'Basic support',
                    '30-day access'
                ]
            },
            standard: {
                price: recommendedPrice,
                features: [
                    'Course videos',
                    'Downloadable resources',
                    'Priority support',
                    'Lifetime access',
                    'Certificate of completion'
                ]
            },
            premium: {
                price: Math.round(recommendedPrice * 1.5),
                features: [
                    'Everything in Standard',
                    '1-on-1 mentoring session',
                    'Bonus materials',
                    'Early access to new content',
                    'Private community access'
                ]
            }
        };
    }
}
// Export for use in routes
export default VideoAnalyzer;
//# sourceMappingURL=videoAnalyzer.js.map