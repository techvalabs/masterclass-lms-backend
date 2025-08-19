#!/usr/bin/env node

/**
 * Production Data Import Utility
 * Real Estate Masterclass LMS
 * 
 * This utility handles importing production data from various sources
 * including CSV files, JSON exports, and external APIs.
 */

import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DataImporter {
    constructor() {
        this.connection = null;
        this.importPath = path.join(__dirname, '..', 'imports');
        
        // Database configuration
        this.dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'masterclass_lms',
            charset: 'utf8mb4',
            timezone: '+00:00'
        };

        // Ensure imports directory exists
        if (!fs.existsSync(this.importPath)) {
            fs.mkdirSync(this.importPath, { recursive: true });
        }
    }

    /**
     * Initialize database connection
     */
    async connect() {
        try {
            console.log(chalk.blue('🔌 Connecting to database...'));
            this.connection = await mysql.createConnection(this.dbConfig);
            console.log(chalk.green('✅ Database connected successfully'));
            return true;
        } catch (error) {
            console.error(chalk.red('❌ Database connection failed:'), error.message);
            return false;
        }
    }

    /**
     * Close database connection
     */
    async disconnect() {
        if (this.connection) {
            await this.connection.end();
            console.log(chalk.blue('🔌 Database connection closed'));
        }
    }

    /**
     * Import users from CSV
     * Expected columns: name, email, role, location, phone, bio
     */
    async importUsersFromCSV(filename) {
        const filePath = path.join(this.importPath, filename);
        
        if (!fs.existsSync(filePath)) {
            console.error(chalk.red(`❌ File not found: ${filePath}`));
            return false;
        }

        console.log(chalk.blue('👥 Importing users from CSV...'));

        return new Promise((resolve) => {
            const users = [];
            let lineCount = 0;
            let errorCount = 0;

            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (row) => {
                    lineCount++;
                    try {
                        // Validate required fields
                        if (!row.name || !row.email) {
                            console.warn(chalk.yellow(`⚠️  Line ${lineCount}: Missing required fields (name, email)`));
                            errorCount++;
                            return;
                        }

                        // Map role name to role_id
                        const roleMap = {
                            'student': 1,
                            'instructor': 2,
                            'admin': 3,
                            'moderator': 4
                        };

                        users.push({
                            name: row.name.trim(),
                            email: row.email.trim().toLowerCase(),
                            role_id: roleMap[row.role?.toLowerCase()] || 1,
                            location: row.location?.trim() || null,
                            phone: row.phone?.trim() || null,
                            bio: row.bio?.trim() || null,
                            password_hash: null, // Will be generated
                            email_verified: true,
                            is_active: true
                        });
                    } catch (error) {
                        console.warn(chalk.yellow(`⚠️  Line ${lineCount}: ${error.message}`));
                        errorCount++;
                    }
                })
                .on('end', async () => {
                    console.log(chalk.blue(`📊 Processed ${lineCount} lines, ${errorCount} errors`));
                    
                    if (users.length === 0) {
                        console.error(chalk.red('❌ No valid users to import'));
                        resolve(false);
                        return;
                    }

                    try {
                        await this.connection.beginTransaction();

                        let importedCount = 0;
                        let skippedCount = 0;

                        for (const user of users) {
                            try {
                                // Check if user already exists
                                const [existing] = await this.connection.execute(
                                    'SELECT id FROM users WHERE email = ?',
                                    [user.email]
                                );

                                if (existing.length > 0) {
                                    console.log(chalk.gray(`⏭️  Skipping existing user: ${user.email}`));
                                    skippedCount++;
                                    continue;
                                }

                                // Generate default password
                                const defaultPassword = 'Welcome123!';
                                user.password_hash = await bcrypt.hash(defaultPassword, 12);

                                // Insert user
                                await this.connection.execute(`
                                    INSERT INTO users 
                                    (name, email, password_hash, role_id, location, phone, bio, email_verified, is_active, created_at, updated_at)
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                                `, [
                                    user.name, user.email, user.password_hash, user.role_id,
                                    user.location, user.phone, user.bio, user.email_verified, user.is_active
                                ]);

                                importedCount++;
                                console.log(chalk.green(`✅ Imported user: ${user.email}`));

                            } catch (userError) {
                                console.error(chalk.red(`❌ Failed to import user ${user.email}: ${userError.message}`));
                                errorCount++;
                            }
                        }

                        await this.connection.commit();

                        console.log(chalk.green(`\n🎉 User import completed:`));
                        console.log(chalk.green(`   - Imported: ${importedCount}`));
                        console.log(chalk.yellow(`   - Skipped: ${skippedCount}`));
                        console.log(chalk.red(`   - Errors: ${errorCount}`));

                        resolve(true);

                    } catch (error) {
                        await this.connection.rollback();
                        console.error(chalk.red('❌ Import transaction failed:'), error.message);
                        resolve(false);
                    }
                });
        });
    }

    /**
     * Import courses from JSON
     */
    async importCoursesFromJSON(filename) {
        const filePath = path.join(this.importPath, filename);
        
        if (!fs.existsSync(filePath)) {
            console.error(chalk.red(`❌ File not found: ${filePath}`));
            return false;
        }

        console.log(chalk.blue('📚 Importing courses from JSON...'));

        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            if (!Array.isArray(data.courses)) {
                console.error(chalk.red('❌ Invalid JSON format: expected { courses: [...] }'));
                return false;
            }

            await this.connection.beginTransaction();

            let importedCount = 0;
            let errorCount = 0;

            for (const course of data.courses) {
                try {
                    // Validate required fields
                    if (!course.title || !course.instructor_email) {
                        console.warn(chalk.yellow(`⚠️  Skipping course: missing title or instructor_email`));
                        errorCount++;
                        continue;
                    }

                    // Find instructor by email
                    const [instructorResult] = await this.connection.execute(`
                        SELECT i.id 
                        FROM instructors i 
                        JOIN users u ON i.user_id = u.id 
                        WHERE u.email = ?
                    `, [course.instructor_email]);

                    if (instructorResult.length === 0) {
                        console.warn(chalk.yellow(`⚠️  Instructor not found: ${course.instructor_email}`));
                        errorCount++;
                        continue;
                    }

                    const instructorId = instructorResult[0].id;

                    // Generate slug from title
                    const slug = course.slug || course.title.toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-|-$/g, '');

                    // Insert course
                    const [result] = await this.connection.execute(`
                        INSERT INTO courses 
                        (title, slug, description, thumbnail, price, currency, level, duration_hours, 
                         instructor_id, category_id, is_published, is_featured, language, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                    `, [
                        course.title,
                        slug,
                        course.description || '',
                        course.thumbnail || null,
                        course.price || 0,
                        course.currency || 'USD',
                        course.level || 'beginner',
                        course.duration_hours || 10,
                        instructorId,
                        course.category_id || 1,
                        course.is_published || false,
                        course.is_featured || false,
                        course.language || 'English'
                    ]);

                    const courseId = result.insertId;

                    // Import lessons if provided
                    if (course.lessons && Array.isArray(course.lessons)) {
                        for (let i = 0; i < course.lessons.length; i++) {
                            const lesson = course.lessons[i];
                            
                            const lessonSlug = lesson.slug || lesson.title.toLowerCase()
                                .replace(/[^a-z0-9]+/g, '-')
                                .replace(/^-|-$/g, '');

                            await this.connection.execute(`
                                INSERT INTO course_lessons 
                                (course_id, title, slug, description, video_url, duration_minutes, 
                                 lesson_order, is_free_preview, content_type, created_at, updated_at)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                            `, [
                                courseId,
                                lesson.title,
                                lessonSlug,
                                lesson.description || '',
                                lesson.video_url || null,
                                lesson.duration_minutes || 30,
                                i + 1,
                                lesson.is_free_preview || false,
                                lesson.content_type || 'video'
                            ]);
                        }
                    }

                    importedCount++;
                    console.log(chalk.green(`✅ Imported course: ${course.title}`));

                } catch (courseError) {
                    console.error(chalk.red(`❌ Failed to import course ${course.title}: ${courseError.message}`));
                    errorCount++;
                }
            }

            await this.connection.commit();

            console.log(chalk.green(`\n🎉 Course import completed:`));
            console.log(chalk.green(`   - Imported: ${importedCount}`));
            console.log(chalk.red(`   - Errors: ${errorCount}`));

            return true;

        } catch (error) {
            await this.connection.rollback();
            console.error(chalk.red('❌ Course import failed:'), error.message);
            return false;
        }
    }

    /**
     * Export data to JSON
     */
    async exportToJSON(tables, outputFile) {
        console.log(chalk.blue('📤 Exporting data to JSON...'));

        try {
            const exportData = {};

            for (const table of tables) {
                console.log(chalk.gray(`Exporting table: ${table}`));
                
                const [rows] = await this.connection.execute(`SELECT * FROM ${table}`);
                exportData[table] = rows;
            }

            const outputPath = path.join(this.importPath, outputFile);
            fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

            console.log(chalk.green(`✅ Data exported to: ${outputPath}`));
            return true;

        } catch (error) {
            console.error(chalk.red('❌ Export failed:'), error.message);
            return false;
        }
    }

    /**
     * Import from external LMS (example: Moodle backup)
     */
    async importFromMoodleBackup(filename) {
        console.log(chalk.blue('📥 Importing from Moodle backup...'));
        console.log(chalk.yellow('⚠️  This is a placeholder for Moodle import functionality'));
        console.log(chalk.gray('Implementation would require parsing Moodle XML backup files'));
        return false;
    }

    /**
     * Validate import file format
     */
    validateImportFile(filename, expectedType) {
        const filePath = path.join(this.importPath, filename);
        
        if (!fs.existsSync(filePath)) {
            console.error(chalk.red(`❌ File not found: ${filePath}`));
            return false;
        }

        const ext = path.extname(filename).toLowerCase();
        
        if (expectedType === 'csv' && ext !== '.csv') {
            console.error(chalk.red('❌ Expected CSV file'));
            return false;
        }

        if (expectedType === 'json' && ext !== '.json') {
            console.error(chalk.red('❌ Expected JSON file'));
            return false;
        }

        return true;
    }

    /**
     * Generate sample import files
     */
    generateSampleFiles() {
        console.log(chalk.blue('📝 Generating sample import files...'));

        // Sample users CSV
        const usersCsv = `name,email,role,location,phone,bio
John Doe,john.doe@example.com,student,"New York, NY",+1-555-0123,"Aspiring real estate investor"
Jane Smith,jane.smith@example.com,instructor,"Los Angeles, CA",+1-555-0456,"Real estate expert with 10 years experience"
Bob Johnson,bob.johnson@example.com,student,"Chicago, IL",+1-555-0789,"Looking to build rental property portfolio"`;

        fs.writeFileSync(path.join(this.importPath, 'sample-users.csv'), usersCsv);

        // Sample courses JSON
        const coursesJson = {
            courses: [
                {
                    title: "Real Estate Investment Basics",
                    instructor_email: "jane.smith@example.com",
                    description: "Learn the fundamentals of real estate investing",
                    price: 199.00,
                    currency: "USD",
                    level: "beginner",
                    duration_hours: 15,
                    category_id: 1,
                    is_published: true,
                    lessons: [
                        {
                            title: "Introduction to Real Estate",
                            description: "Overview of real estate investment",
                            duration_minutes: 45,
                            is_free_preview: true,
                            content_type: "video"
                        },
                        {
                            title: "Understanding Cash Flow",
                            description: "How to calculate property cash flow",
                            duration_minutes: 60,
                            content_type: "video"
                        }
                    ]
                }
            ]
        };

        fs.writeFileSync(
            path.join(this.importPath, 'sample-courses.json'), 
            JSON.stringify(coursesJson, null, 2)
        );

        console.log(chalk.green('✅ Sample files generated:'));
        console.log(chalk.gray(`   - ${this.importPath}/sample-users.csv`));
        console.log(chalk.gray(`   - ${this.importPath}/sample-courses.json`));
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const filename = args[1];

    if (!command) {
        console.log(chalk.blue('📊 Real Estate Masterclass LMS - Data Import Utility'));
        console.log(chalk.gray('Usage: node data-importer.js [command] [filename]'));
        console.log('');
        console.log(chalk.yellow('Commands:'));
        console.log('  import-users [csv-file]     Import users from CSV');
        console.log('  import-courses [json-file]  Import courses from JSON');
        console.log('  export [output-file]        Export data to JSON');
        console.log('  sample                      Generate sample import files');
        console.log('  import-moodle [backup-file] Import from Moodle backup (placeholder)');
        console.log('');
        console.log(chalk.yellow('Examples:'));
        console.log('  node data-importer.js import-users users.csv');
        console.log('  node data-importer.js import-courses courses.json');
        console.log('  node data-importer.js export backup.json');
        console.log('  node data-importer.js sample');
        return;
    }

    const importer = new DataImporter();

    // Connect to database (except for sample generation)
    if (command !== 'sample') {
        const connected = await importer.connect();
        if (!connected) {
            process.exit(1);
        }
    }

    try {
        let success = false;

        switch (command) {
            case 'import-users':
                if (!filename) {
                    console.error(chalk.red('❌ Please specify CSV filename'));
                    process.exit(1);
                }
                success = await importer.importUsersFromCSV(filename);
                break;

            case 'import-courses':
                if (!filename) {
                    console.error(chalk.red('❌ Please specify JSON filename'));
                    process.exit(1);
                }
                success = await importer.importCoursesFromJSON(filename);
                break;

            case 'export':
                const outputFile = filename || 'export.json';
                const tables = ['users', 'courses', 'course_lessons', 'enrollments', 'instructors'];
                success = await importer.exportToJSON(tables, outputFile);
                break;

            case 'import-moodle':
                if (!filename) {
                    console.error(chalk.red('❌ Please specify Moodle backup filename'));
                    process.exit(1);
                }
                success = await importer.importFromMoodleBackup(filename);
                break;

            case 'sample':
                importer.generateSampleFiles();
                success = true;
                break;

            default:
                console.error(chalk.red(`❌ Unknown command: ${command}`));
                process.exit(1);
        }

        process.exit(success ? 0 : 1);

    } catch (error) {
        console.error(chalk.red('❌ Unexpected error:'), error.message);
        process.exit(1);
    } finally {
        await importer.disconnect();
    }
}

// Export for programmatic use
export { DataImporter };

// Run CLI if called directly
if (process.argv[1] === __filename || process.argv[1].endsWith('data-importer.js')) {
    main().catch(error => {
        console.error(chalk.red('❌ Fatal error:'), error.message);
        process.exit(1);
    });
}