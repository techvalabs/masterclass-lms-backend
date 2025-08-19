import { v4 as uuidv4 } from 'uuid';
import { Database } from '@/config/database.js';
import { logger } from '@/utils/logger.js';
import { userIds } from './users.js';
/**
 * Instructors Seeder
 * Creates instructor profiles based on the frontend mock data
 */
const instructors = [
    {
        id: uuidv4(),
        user_id: userIds.instructor,
        bio: 'Real Estate Expert & Master Educator with 15+ Years Experience. Loweta has successfully completed hundreds of real estate transactions including wholesaling, flipping, and creative financing deals. She has trained thousands of students and helped them achieve financial freedom through real estate investing.',
        expertise: [
            'Real Estate Wholesaling',
            'House Flipping & Renovation',
            'Creative Financing Strategies',
            'Contract Assignment',
            'Deal Analysis & Evaluation',
            'Property Acquisition',
            'Land Development',
            'Market Analysis',
            'Negotiation Tactics',
            'Investment Property Management'
        ],
        rating: 4.9,
        total_ratings: 1250,
        students_count: 50000,
        courses_count: 5,
        total_earnings: 2500000.00,
        commission_rate: 0.7000,
        is_verified: true,
        verification_date: new Date('2024-01-01'),
    },
];
export async function seedInstructors() {
    try {
        logger.info('Seeding instructors...');
        for (const instructor of instructors) {
            await Database.query(`
        INSERT INTO instructors (
          id, user_id, bio, expertise, rating, total_ratings,
          students_count, courses_count, total_earnings, commission_rate,
          is_verified, verification_date, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
                instructor.id,
                instructor.user_id,
                instructor.bio,
                JSON.stringify(instructor.expertise),
                instructor.rating,
                instructor.total_ratings,
                instructor.students_count,
                instructor.courses_count,
                instructor.total_earnings,
                instructor.commission_rate,
                instructor.is_verified,
                instructor.verification_date,
            ]);
            logger.debug(`Created instructor profile for user: ${instructor.user_id}`);
        }
        logger.info(`✓ Created ${instructors.length} instructor profiles`);
    }
    catch (error) {
        logger.error('Instructors seeding failed:', error);
        throw error;
    }
}
// Export instructor IDs for use in other seeders
export const instructorIds = {
    loweta: instructors[0].id,
};
export default seedInstructors;
//# sourceMappingURL=instructors.js.map