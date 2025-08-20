import { v4 as uuidv4 } from 'uuid';
import Database from '@/config/database.js';
import { logger } from '@/utils/logger.js';

/**
 * Categories Seeder
 * Creates course categories matching the frontend data
 */

const categories = [
  {
    id: uuidv4(),
    name: 'Real Estate Wholesaling',
    slug: 'wholesaling',
    description: 'Learn the fundamentals of real estate wholesaling - finding motivated sellers, negotiating contracts, and assigning deals for quick profits.',
    icon: 'home',
    color: '#3B82F6',
    sort_order: 1,
  },
  {
    id: uuidv4(),
    name: 'House Flipping',
    slug: 'flipping',
    description: 'Master the art of house flipping and renovation - from property acquisition to profitable resale.',
    icon: 'hammer',
    color: '#EF4444',
    sort_order: 2,
  },
  {
    id: uuidv4(),
    name: 'Creative Financing',
    slug: 'creative-financing',
    description: 'Alternative financing strategies for real estate - seller financing, lease options, and creative deal structures.',
    icon: 'credit-card',
    color: '#10B981',
    sort_order: 3,
  },
  {
    id: uuidv4(),
    name: 'Land Development',
    slug: 'land-development',
    description: 'Land development and subdivision strategies - from raw land acquisition to profitable development projects.',
    icon: 'map',
    color: '#F59E0B',
    sort_order: 4,
  },
  {
    id: uuidv4(),
    name: 'Property Purchasing',
    slug: 'property-purchasing',
    description: 'Smart property acquisition strategies - market analysis, negotiation tactics, and due diligence.',
    icon: 'building',
    color: '#8B5CF6',
    sort_order: 5,
  },
];

export async function seedCategories(): Promise<void> {
  try {
    logger.info('Seeding categories...');

    // Insert categories
    for (const category of categories) {
      await Database.query(`
        INSERT INTO categories (
          id, name, slug, description, icon, color, sort_order, 
          is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, NOW(), NOW())
      `, [
        category.id,
        category.name,
        category.slug,
        category.description,
        category.icon,
        category.color,
        category.sort_order,
      ]);

      logger.debug(`Created category: ${category.name}`);
    }

    logger.info(`✓ Created ${categories.length} categories`);

  } catch (error) {
    logger.error('Categories seeding failed:', error);
    throw error;
  }
}

// Export category IDs for use in other seeders
export const categoryIds = {
  wholesaling: categories[0].id,
  flipping: categories[1].id,
  creativeFinancing: categories[2].id,
  landDevelopment: categories[3].id,
  propertyPurchasing: categories[4].id,
};

export default seedCategories;