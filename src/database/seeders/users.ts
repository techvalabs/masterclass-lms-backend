import { v4 as uuidv4 } from 'uuid';
import Database from '@/config/database.js';
import { PasswordUtils } from '@/middleware/auth.js';
import { logger } from '@/utils/logger.js';

/**
 * Users Seeder
 * Creates initial users including admin, instructors, and students
 */

const users = [
  {
    id: uuidv4(),
    name: 'Admin User',
    email: 'admin@masterclass-lms.com',
    password: 'Admin123!@#',
    role: 'admin',
    avatar: '/img/admin-avatar.jpg',
    is_active: true,
    email_verified_at: new Date(),
  },
  {
    id: uuidv4(),
    name: 'Loweta Gonzales',
    email: 'loweta@masterclass-lms.com',
    password: 'Instructor123!@#',
    role: 'instructor',
    avatar: '/img/loweta.jpg',
    is_active: true,
    email_verified_at: new Date(),
  },
  {
    id: uuidv4(),
    name: 'John Student',
    email: 'john.student@example.com',
    password: 'Student123!@#',
    role: 'student',
    avatar: null,
    is_active: true,
    email_verified_at: new Date(),
  },
  {
    id: uuidv4(),
    name: 'Jane Learner',
    email: 'jane.learner@example.com',
    password: 'Student123!@#',
    role: 'student',
    avatar: null,
    is_active: true,
    email_verified_at: new Date(),
  },
  {
    id: uuidv4(),
    name: 'Mike Investor',
    email: 'mike.investor@example.com',
    password: 'Student123!@#',
    role: 'student',
    avatar: null,
    is_active: true,
    email_verified_at: new Date(),
  },
];

export async function seedUsers(): Promise<void> {
  try {
    logger.info('Seeding users...');

    for (const user of users) {
      // Hash password
      const passwordHash = await PasswordUtils.hash(user.password);

      // Insert user
      await Database.query(`
        INSERT INTO users (
          id, email, name, password_hash, avatar, role, 
          is_active, email_verified_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        user.id,
        user.email,
        user.name,
        passwordHash,
        user.avatar,
        user.role,
        user.is_active,
        user.email_verified_at,
      ]);

      // Create user profile
      await Database.query(`
        INSERT INTO user_profiles (
          id, user_id, bio, timezone, marketing_consent, created_at, updated_at
        ) VALUES (UUID(), ?, ?, 'UTC', FALSE, NOW(), NOW())
      `, [
        user.id,
        getUserBio(user.role, user.name),
      ]);

      logger.debug(`Created user: ${user.name} (${user.email})`);
    }

    logger.info(`✓ Created ${users.length} users`);

  } catch (error) {
    logger.error('Users seeding failed:', error);
    throw error;
  }
}

function getUserBio(role: string, name: string): string {
  switch (role) {
    case 'admin':
      return 'System administrator with full access to platform management and user oversight.';
    case 'instructor':
      return 'Experienced real estate professional and educator with 15+ years in the industry.';
    case 'student':
      return `Real estate enthusiast and lifelong learner focused on building expertise in property investment and development.`;
    default:
      return 'Platform user interested in real estate education and professional development.';
  }
}

// Export user IDs for use in other seeders
export const userIds = {
  admin: users[0].id,
  instructor: users[1].id,
  student1: users[2].id,
  student2: users[3].id,
  student3: users[4].id,
};

export const userData = users;

export default seedUsers;