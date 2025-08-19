import { Database } from '@/config/database.js';
import { logger } from '@/utils/logger.js';
import { seedCategories } from './categories.js';
import { seedUsers } from './users.js';
import { seedInstructors } from './instructors.js';
import { seedCourses } from './courses.js';
import { seedModulesAndLessons } from './modules.js';
import { seedSystemSettings } from './settings.js';
/**
 * Database Seeder
 * Populates database with initial data from the frontend mock data
 */
export class DatabaseSeeder {
    /**
     * Run all seeders
     */
    static async run(options = {}) {
        const { force = false, skipExisting = true } = options;
        try {
            logger.info('Starting database seeding...');
            // Check if data already exists
            if (!force && skipExisting) {
                const { rows } = await Database.query('SELECT COUNT(*) as count FROM users');
                if (rows[0].count > 0) {
                    logger.info('Database already contains data. Use --force to reseed.');
                    return;
                }
            }
            // Run seeders in order (respecting foreign key constraints)
            await this.runSeederWithTransaction('System Settings', seedSystemSettings);
            await this.runSeederWithTransaction('Categories', seedCategories);
            await this.runSeederWithTransaction('Users', seedUsers);
            await this.runSeederWithTransaction('Instructors', seedInstructors);
            await this.runSeederWithTransaction('Courses', seedCourses);
            await this.runSeederWithTransaction('Modules and Lessons', seedModulesAndLessons);
            logger.info('Database seeding completed successfully!');
        }
        catch (error) {
            logger.error('Database seeding failed:', error);
            throw error;
        }
    }
    /**
     * Run individual seeder with transaction
     */
    static async runSeederWithTransaction(name, seeder) {
        try {
            logger.info(`Seeding ${name}...`);
            await Database.transaction(async (connection) => {
                await seeder();
            });
            logger.info(`✓ ${name} seeded successfully`);
        }
        catch (error) {
            logger.error(`✗ Failed to seed ${name}:`, error);
            throw error;
        }
    }
    /**
     * Clear all data (for development/testing)
     */
    static async clear() {
        try {
            logger.info('Clearing database data...');
            // Disable foreign key checks temporarily
            await Database.query('SET FOREIGN_KEY_CHECKS = 0');
            // Define tables in reverse dependency order
            const tables = [
                'lesson_progress',
                'quiz_attempts',
                'quiz_questions',
                'quizzes',
                'resources',
                'lessons',
                'modules',
                'course_ratings',
                'enrollments',
                'certificates',
                'order_items',
                'orders',
                'coupon_usage',
                'coupons',
                'courses',
                'instructors',
                'user_profiles',
                'users',
                'categories',
                'notifications',
                'activity_logs',
                'file_uploads',
                'jwt_blacklist',
                'system_settings'
            ];
            // Truncate tables
            for (const table of tables) {
                try {
                    await Database.query(`TRUNCATE TABLE ${table}`);
                    logger.debug(`Cleared table: ${table}`);
                }
                catch (error) {
                    logger.warn(`Failed to clear table ${table}:`, error);
                }
            }
            // Re-enable foreign key checks
            await Database.query('SET FOREIGN_KEY_CHECKS = 1');
            logger.info('Database cleared successfully');
        }
        catch (error) {
            logger.error('Database clear failed:', error);
            // Ensure foreign key checks are re-enabled
            await Database.query('SET FOREIGN_KEY_CHECKS = 1');
            throw error;
        }
    }
    /**
     * Reset database (clear + seed)
     */
    static async reset() {
        await this.clear();
        await this.run({ force: true });
    }
    /**
     * Check if database is seeded
     */
    static async isSeeded() {
        try {
            const { rows } = await Database.query(`
        SELECT 
          (SELECT COUNT(*) FROM users) as user_count,
          (SELECT COUNT(*) FROM courses) as course_count,
          (SELECT COUNT(*) FROM categories) as category_count
      `);
            const counts = rows[0];
            return counts.user_count > 0 && counts.course_count > 0 && counts.category_count > 0;
        }
        catch (error) {
            logger.error('Failed to check seeding status:', error);
            return false;
        }
    }
    /**
     * Get seeding statistics
     */
    static async getStats() {
        try {
            const { rows } = await Database.query(`
        SELECT 
          (SELECT COUNT(*) FROM users) as users,
          (SELECT COUNT(*) FROM instructors) as instructors,
          (SELECT COUNT(*) FROM courses) as courses,
          (SELECT COUNT(*) FROM modules) as modules,
          (SELECT COUNT(*) FROM lessons) as lessons,
          (SELECT COUNT(*) FROM categories) as categories,
          (SELECT COUNT(*) FROM enrollments) as enrollments
      `);
            return rows[0];
        }
        catch (error) {
            logger.error('Failed to get seeding stats:', error);
            return {
                users: 0,
                instructors: 0,
                courses: 0,
                modules: 0,
                lessons: 0,
                categories: 0,
                enrollments: 0,
            };
        }
    }
}
// CLI interface
if (process.argv[1].endsWith('index.js') || process.argv[1].endsWith('index.ts')) {
    const command = process.argv[2];
    const force = process.argv.includes('--force');
    (async () => {
        try {
            await Database.initialize();
            switch (command) {
                case 'seed':
                    await DatabaseSeeder.run({ force });
                    break;
                case 'clear':
                    await DatabaseSeeder.clear();
                    break;
                case 'reset':
                    await DatabaseSeeder.reset();
                    break;
                case 'status':
                    const isSeeded = await DatabaseSeeder.isSeeded();
                    const stats = await DatabaseSeeder.getStats();
                    console.log('Database Status:', isSeeded ? 'Seeded' : 'Empty');
                    console.log('Statistics:', stats);
                    break;
                default:
                    console.log('Usage: node seed.js [seed|clear|reset|status] [--force]');
                    console.log('Commands:');
                    console.log('  seed   - Populate database with initial data');
                    console.log('  clear  - Remove all data from database');
                    console.log('  reset  - Clear and then seed database');
                    console.log('  status - Show current database status');
                    console.log('Options:');
                    console.log('  --force - Force operation even if data exists');
                    break;
            }
            await Database.close();
            process.exit(0);
        }
        catch (error) {
            console.error('Seeder failed:', error);
            process.exit(1);
        }
    })();
}
export default DatabaseSeeder;
//# sourceMappingURL=index.js.map