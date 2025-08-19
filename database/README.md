# Database Management - Real Estate Masterclass LMS

This directory contains database migration scripts, utilities, and documentation for the Real Estate Masterclass LMS system.

## Directory Structure

```
database/
├── migrations/          # Database migration files
│   ├── 001_create_initial_schema.sql
│   ├── 002_insert_initial_data.sql
│   └── 003_seed_realistic_data.sql
├── utilities/           # Database management utilities
│   ├── migration-runner.js
│   └── data-importer.js
├── imports/            # Data import/export files (created automatically)
└── README.md           # This file
```

## Migration Files

### 001_create_initial_schema.sql
Complete database schema creation with:
- **30+ tables** for comprehensive LMS functionality
- **User management** (users, roles, permissions)
- **Course system** (courses, lessons, categories, progress tracking)
- **Payment processing** (transactions, refunds, coupons)
- **Learning features** (quizzes, assignments, certificates)
- **Analytics & reporting** (activity logs, instructor earnings)
- **Advanced features** (notifications, reviews, discussion forums)

### 002_insert_initial_data.sql
Essential system data:
- **4 user roles** with detailed permissions (student, instructor, admin, moderator)
- **100+ system settings** covering all aspects of the LMS
- **Default users** (admin, sample instructor, sample student)
- **Version tracking** for database schema management

### 003_seed_realistic_data.sql
Comprehensive development/testing data:
- **13 realistic users** with authentic profiles and avatars
- **4 professional instructors** with detailed credentials
- **8 course categories** covering real estate investing topics
- **8 complete courses** with realistic content and pricing
- **25+ course lessons** with proper sequencing
- **20 student enrollments** with realistic progress tracking
- **20 payment transactions** using various payment methods
- **17 authentic course reviews** with helpful ratings
- **Activity logs, quiz attempts, certificates, and notifications**

## Database Utilities

### Migration Runner (`utilities/migration-runner.js`)

Professional database migration management tool with:

#### Features
- **Sequential migration execution** with dependency tracking
- **Transaction safety** with automatic rollback on errors
- **Checksum validation** to detect file changes
- **Execution timing** and performance monitoring
- **Migration status tracking** with detailed history
- **Force re-run capability** for development

#### Usage
```bash
# Run all pending migrations
node database/utilities/migration-runner.js migrate

# Show migration status
node database/utilities/migration-runner.js status

# Seed development data
node database/utilities/migration-runner.js seed

# Reset database (drops all tables and re-runs migrations)
node database/utilities/migration-runner.js reset

# Run specific migration
node database/utilities/migration-runner.js migrate --file=001_create_initial_schema.sql

# Force re-run all migrations
node database/utilities/migration-runner.js migrate --force
```

### Data Importer (`utilities/data-importer.js`)

Production-ready data import/export utility:

#### Features
- **CSV user import** with validation and duplicate detection
- **JSON course import** with lesson support
- **Data export** to JSON format for backups
- **Sample file generation** for testing
- **Error handling** with detailed reporting
- **Transaction safety** with rollback capabilities

#### Usage
```bash
# Generate sample import files
node database/utilities/data-importer.js sample

# Import users from CSV
node database/utilities/data-importer.js import-users users.csv

# Import courses from JSON
node database/utilities/data-importer.js import-courses courses.json

# Export data for backup
node database/utilities/data-importer.js export backup.json
```

#### CSV User Import Format
```csv
name,email,role,location,phone,bio
John Doe,john@example.com,student,"New York, NY",+1-555-0123,"Aspiring investor"
Jane Smith,jane@example.com,instructor,"LA, CA",+1-555-0456,"Real estate expert"
```

#### JSON Course Import Format
```json
{
  "courses": [
    {
      "title": "Real Estate Basics",
      "instructor_email": "instructor@example.com",
      "description": "Learn the fundamentals",
      "price": 199.00,
      "currency": "USD",
      "level": "beginner",
      "duration_hours": 15,
      "category_id": 1,
      "is_published": true,
      "lessons": [
        {
          "title": "Introduction",
          "description": "Course overview",
          "duration_minutes": 45,
          "is_free_preview": true,
          "content_type": "video"
        }
      ]
    }
  ]
}
```

## Environment Configuration

Set these environment variables for database connection:

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=masterclass_lms
```

## Installation Dependencies

Install required Node.js packages:

```bash
npm install mysql2 csv-parser bcrypt chalk
```

## Development Workflow

### 1. Initial Setup
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE masterclass_lms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run initial migrations
node database/utilities/migration-runner.js migrate

# Seed development data
node database/utilities/migration-runner.js seed
```

### 2. Adding New Features
```bash
# Create new migration file (numbered sequentially)
# Example: 004_add_discussion_forums.sql

# Run new migrations
node database/utilities/migration-runner.js migrate

# Check migration status
node database/utilities/migration-runner.js status
```

### 3. Production Deployment
```bash
# Export current data for backup
node database/utilities/data-importer.js export production-backup.json

# Run migrations on production
DB_HOST=prod-server node database/utilities/migration-runner.js migrate

# Import production user data
node database/utilities/data-importer.js import-users production-users.csv
```

## Database Design Principles

### 1. Security
- **Password hashing** using bcrypt with salt rounds
- **SQL injection prevention** through parameterized queries
- **Role-based permissions** with JSON arrays for flexibility
- **Activity logging** for audit trails

### 2. Performance
- **Strategic indexing** on frequently queried columns
- **Foreign key constraints** for data integrity
- **Optimized queries** in views for complex reporting
- **Pagination support** in all listing endpoints

### 3. Scalability
- **Normalized design** to minimize data redundancy
- **JSON columns** for flexible metadata storage
- **Soft deletes** for data preservation
- **Audit trails** for compliance and debugging

### 4. Maintainability
- **Clear naming conventions** for tables and columns
- **Comprehensive documentation** in migration files
- **Version tracking** for schema changes
- **Consistent data types** across related tables

## Backup and Recovery

### Daily Backup Script
```bash
#!/bin/bash
# Create daily database backup
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p masterclass_lms > "backup_${DATE}.sql"

# Export data in JSON format
node database/utilities/data-importer.js export "data_backup_${DATE}.json"
```

### Recovery Process
```bash
# Restore from SQL dump
mysql -u root -p masterclass_lms < backup_20240214_120000.sql

# Or rebuild from migrations
node database/utilities/migration-runner.js reset
```

## Monitoring and Maintenance

### Performance Monitoring
- Monitor slow query log for optimization opportunities
- Track migration execution times
- Watch database size growth and plan for scaling

### Regular Maintenance
- Update realistic seed data as the application evolves
- Review and optimize indexes based on query patterns
- Clean up old activity logs and temporary data
- Test backup and recovery procedures monthly

## Troubleshooting

### Common Issues

1. **Migration Fails**
   ```bash
   # Check migration status
   node database/utilities/migration-runner.js status
   
   # Force re-run if needed
   node database/utilities/migration-runner.js migrate --force
   ```

2. **Data Import Errors**
   ```bash
   # Validate import file format
   # Check database connection
   # Review error messages in console output
   ```

3. **Connection Issues**
   ```bash
   # Verify environment variables
   # Check database server status
   # Confirm user permissions
   ```

## Contributing

When adding new features that require database changes:

1. Create a new migration file with sequential numbering
2. Include both UP and DOWN operations where possible
3. Test migrations on development data
4. Update this README with any new procedures
5. Consider impact on existing data and provide upgrade paths

## Security Considerations

- Never commit database credentials to version control
- Use environment variables for all configuration
- Implement proper access controls on production databases
- Regularly update dependencies for security patches
- Monitor for suspicious activity in audit logs

---

For technical support or questions about database management, refer to the main project documentation or contact the development team.