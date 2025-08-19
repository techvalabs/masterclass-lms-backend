/**
 * Database Seeder
 * Populates database with initial data from the frontend mock data
 */
export declare class DatabaseSeeder {
    /**
     * Run all seeders
     */
    static run(options?: {
        force?: boolean;
        skipExisting?: boolean;
    }): Promise<void>;
    /**
     * Run individual seeder with transaction
     */
    private static runSeederWithTransaction;
    /**
     * Clear all data (for development/testing)
     */
    static clear(): Promise<void>;
    /**
     * Reset database (clear + seed)
     */
    static reset(): Promise<void>;
    /**
     * Check if database is seeded
     */
    static isSeeded(): Promise<boolean>;
    /**
     * Get seeding statistics
     */
    static getStats(): Promise<{
        users: number;
        instructors: number;
        courses: number;
        modules: number;
        lessons: number;
        categories: number;
        enrollments: number;
    }>;
}
export default DatabaseSeeder;
//# sourceMappingURL=index.d.ts.map