#!/usr/bin/env node

/**
 * Database Migration Runner Utility
 * Real Estate Masterclass LMS
 * 
 * This utility manages database migrations and data imports for the LMS system.
 * Supports both development seeding and production data imports.
 */

import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import crypto from 'crypto';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.join(__dirname, '..', '..', '.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(chalk.gray(`📁 Loaded environment from: ${envPath}`));
} else {
    console.log(chalk.yellow('⚠️  No .env file found, using default values'));
}

// Auto-detect environment and adjust database host
function getDbHost() {
    const configuredHost = process.env.DB_HOST;
    
    // If running from Windows (not WSL), use localhost
    if (process.platform === 'win32') {
        console.log(chalk.gray('🖥️  Running from Windows - using localhost'));
        return 'localhost';
    }
    
    // If running from WSL, try to get the Windows host IP
    if (fs.existsSync('/proc/sys/fs/binfmt_misc/WSLInterop')) {
        // Try to get the default gateway (Windows host IP from WSL perspective)
        try {
            const routeInfo = fs.readFileSync('/proc/net/route', 'utf8');
            const lines = routeInfo.trim().split('\n');
            for (const line of lines) {
                const parts = line.split('\t');
                if (parts[1] === '00000000') { // Default route
                    const gateway = parts[2];
                    const ip = gateway.match(/.{2}/g).reverse().map(
                        hex => parseInt(hex, 16)
                    ).join('.');
                    console.log(chalk.gray(`🐧 Running from WSL - using Windows host IP: ${ip}`));
                    return ip;
                }
            }
        } catch (error) {
            console.log(chalk.yellow('⚠️  Could not detect Windows host IP, using configured value'));
        }
    }
    
    return configuredHost || 'localhost';
}

class MigrationRunner {
    constructor() {
        this.connection = null;
        this.migrationsPath = path.join(__dirname, '..', 'migrations');
        
        // Database configuration from environment with auto-detection
        this.dbConfig = {
            host: getDbHost(),
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'masterclass_lms',
            charset: 'utf8mb4',
            timezone: '+00:00'
        };

        console.log(chalk.gray(`🔧 Database config: ${this.dbConfig.user}@${this.dbConfig.host}:${this.dbConfig.port}/${this.dbConfig.database}`));
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
            console.log(chalk.yellow('💡 Tip: Check your database server and connection settings'));
            console.log(chalk.yellow('💡 For WSL/Laragon setups, try updating DB_HOST in .env file'));
            console.log(chalk.yellow('💡 Alternative: Use --dry-run flag to test migrations without database'));
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
     * Get list of migration files
     */
    getMigrationFiles() {
        try {
            const files = fs.readdirSync(this.migrationsPath)
                .filter(file => file.endsWith('.sql'))
                .sort(); // Ensure migrations run in order
            
            return files.map(file => ({
                filename: file,
                path: path.join(this.migrationsPath, file),
                name: file.replace('.sql', '')
            }));
        } catch (error) {
            console.error(chalk.red('❌ Error reading migrations directory:'), error.message);
            return [];
        }
    }

    /**
     * Check if migrations table exists, create if not
     */
    async ensureMigrationsTable() {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS migrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                filename VARCHAR(255) NOT NULL UNIQUE,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                checksum VARCHAR(64),
                success BOOLEAN DEFAULT TRUE,
                execution_time_ms INT,
                error_message TEXT NULL,
                INDEX idx_filename (filename),
                INDEX idx_executed_at (executed_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `;
        
        await this.connection.execute(createTableQuery);
        console.log(chalk.green('✅ Migrations table ready'));
    }

    /**
     * Get list of executed migrations
     */
    async getExecutedMigrations() {
        const [rows] = await this.connection.execute(
            'SELECT filename FROM migrations WHERE success = TRUE ORDER BY executed_at'
        );
        return rows.map(row => row.filename);
    }

    /**
     * Generate checksum for migration file
     */
    generateChecksum(content) {
        return crypto.createHash('sha256').update(content).digest('hex');
    }

    /**
     * Execute a single migration file
     */
    async executeMigration(migration) {
        const startTime = Date.now();
        
        try {
            console.log(chalk.yellow(`🔄 Executing migration: ${migration.filename}`));
            
            // Read migration file
            const content = fs.readFileSync(migration.path, 'utf8');
            const checksum = this.generateChecksum(content);
            
            // Split content by semicolons and execute each statement
            const statements = content
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
            
            // Begin transaction
            await this.connection.beginTransaction();
            
            try {
                // Disable foreign key checks for the entire transaction
                await this.connection.execute('SET FOREIGN_KEY_CHECKS = 0');
                
                // Execute each statement
                for (const statement of statements) {
                    if (statement.trim()) {
                        await this.connection.execute(statement);
                    }
                }
                
                // Re-enable foreign key checks
                await this.connection.execute('SET FOREIGN_KEY_CHECKS = 1');
                
                // Record successful migration
                const executionTime = Date.now() - startTime;
                await this.connection.execute(
                    'INSERT INTO migrations (filename, checksum, execution_time_ms) VALUES (?, ?, ?)',
                    [migration.filename, checksum, executionTime]
                );
                
                // Commit transaction
                await this.connection.commit();
                
                console.log(chalk.green(`✅ Migration completed: ${migration.filename} (${executionTime}ms)`));
                return true;
                
            } catch (error) {
                // Rollback on error
                await this.connection.rollback();
                throw error;
            }
            
        } catch (error) {
            const executionTime = Date.now() - startTime;
            
            // Record failed migration
            try {
                await this.connection.execute(
                    'INSERT INTO migrations (filename, success, execution_time_ms, error_message) VALUES (?, FALSE, ?, ?)',
                    [migration.filename, executionTime, error.message]
                );
            } catch (recordError) {
                console.error(chalk.red('Failed to record migration error:'), recordError.message);
            }
            
            console.error(chalk.red(`❌ Migration failed: ${migration.filename}`));
            console.error(chalk.red('Error:'), error.message);
            return false;
        }
    }

    /**
     * Run all pending migrations
     */
    async runMigrations(options = {}) {
        const { force = false, specific = null } = options;
        
        await this.ensureMigrationsTable();
        
        const allMigrations = this.getMigrationFiles();
        const executedMigrations = await this.getExecutedMigrations();
        
        let migrationsToRun;
        
        if (specific) {
            // Run specific migration
            migrationsToRun = allMigrations.filter(m => m.filename === specific);
            if (migrationsToRun.length === 0) {
                console.error(chalk.red(`❌ Migration not found: ${specific}`));
                return false;
            }
        } else {
            // Run pending migrations
            migrationsToRun = allMigrations.filter(m => 
                force || !executedMigrations.includes(m.filename)
            );
        }
        
        if (migrationsToRun.length === 0) {
            console.log(chalk.green('✅ All migrations are up to date'));
            return true;
        }
        
        console.log(chalk.blue(`📋 Found ${migrationsToRun.length} migration(s) to execute`));
        
        let allSuccessful = true;
        
        for (const migration of migrationsToRun) {
            const success = await this.executeMigration(migration);
            if (!success) {
                allSuccessful = false;
                if (!force) {
                    console.error(chalk.red('🚫 Stopping migration due to error'));
                    break;
                }
            }
        }
        
        return allSuccessful;
    }

    /**
     * Show migration status
     */
    async showStatus() {
        await this.ensureMigrationsTable();
        
        const allMigrations = this.getMigrationFiles();
        const [executedRows] = await this.connection.execute(
            'SELECT filename, executed_at, success, execution_time_ms, error_message FROM migrations ORDER BY executed_at'
        );
        
        const executedMap = new Map(
            executedRows.map(row => [row.filename, row])
        );
        
        console.log(chalk.blue('\n📋 Migration Status:\n'));
        console.log(chalk.gray('Status | Migration File | Executed At | Time (ms)'));
        console.log(chalk.gray('-------|---------------|-------------|----------'));
        
        for (const migration of allMigrations) {
            const executed = executedMap.get(migration.filename);
            
            if (executed) {
                const status = executed.success ? chalk.green('✅ DONE') : chalk.red('❌ FAIL');
                const time = executed.execution_time_ms || 'N/A';
                const date = executed.executed_at ? executed.executed_at.toISOString().slice(0, 16) : 'N/A';
                
                console.log(`${status} | ${migration.filename} | ${date} | ${time}`);
                
                if (!executed.success && executed.error_message) {
                    console.log(chalk.red(`       Error: ${executed.error_message}`));
                }
            } else {
                console.log(`${chalk.yellow('⏳ PEND')} | ${migration.filename} | Not executed | N/A`);
            }
        }
        
        console.log('\n');
    }

    /**
     * Rollback last migration
     */
    async rollback() {
        console.log(chalk.yellow('⚠️  Rollback functionality not implemented yet'));
        console.log(chalk.gray('Manual rollback required - check migration files for DROP statements'));
    }

    /**
     * Seed development data
     */
    async seedDevelopment() {
        console.log(chalk.blue('🌱 Seeding development data...'));
        
        const seedMigration = this.getMigrationFiles().find(m => 
            m.filename.includes('seed') || m.filename.includes('003')
        );
        
        if (!seedMigration) {
            console.error(chalk.red('❌ Seed migration file not found'));
            return false;
        }
        
        return await this.executeMigration(seedMigration);
    }

    /**
     * Reset database (drop all tables and re-run migrations)
     */
    async reset() {
        console.log(chalk.yellow('⚠️  This will DROP ALL TABLES and rebuild the database'));
        console.log(chalk.yellow('⚠️  ALL DATA WILL BE LOST'));
        
        // In a real implementation, you might want to add a confirmation prompt
        
        try {
            // Get all tables
            const [tables] = await this.connection.execute(
                'SELECT table_name FROM information_schema.tables WHERE table_schema = ?',
                [this.dbConfig.database]
            );
            
            // Disable foreign key checks
            await this.connection.execute('SET FOREIGN_KEY_CHECKS = 0');
            
            // Drop all tables
            for (const table of tables) {
                await this.connection.execute(`DROP TABLE IF EXISTS ${table.table_name}`);
                console.log(chalk.gray(`Dropped table: ${table.table_name}`));
            }
            
            // Re-enable foreign key checks
            await this.connection.execute('SET FOREIGN_KEY_CHECKS = 1');
            
            console.log(chalk.green('✅ Database reset complete'));
            
            // Run all migrations
            return await this.runMigrations();
            
        } catch (error) {
            console.error(chalk.red('❌ Reset failed:'), error.message);
            return false;
        }
    }

    /**
     * Validate migration files without executing them
     */
    async validateMigrations() {
        console.log(chalk.blue('🔍 Validating migration files...'));
        
        const migrations = this.getMigrationFiles();
        
        if (migrations.length === 0) {
            console.log(chalk.yellow('⚠️  No migration files found'));
            return false;
        }
        
        let allValid = true;
        
        for (const migration of migrations) {
            try {
                console.log(chalk.gray(`Checking: ${migration.filename}`));
                
                // Read and validate file content
                const content = fs.readFileSync(migration.path, 'utf8');
                
                if (content.trim().length === 0) {
                    console.error(chalk.red(`❌ ${migration.filename}: Empty file`));
                    allValid = false;
                    continue;
                }
                
                // Basic SQL validation
                const statements = content
                    .split(';')
                    .map(stmt => stmt.trim())
                    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
                
                if (statements.length === 0) {
                    console.error(chalk.red(`❌ ${migration.filename}: No SQL statements found`));
                    allValid = false;
                    continue;
                }
                
                // Check for potentially dangerous operations
                const dangerousPatterns = [
                    /DROP\s+DATABASE/i,
                    /TRUNCATE\s+TABLE/i
                ];
                
                for (const pattern of dangerousPatterns) {
                    if (pattern.test(content)) {
                        console.warn(chalk.yellow(`⚠️  ${migration.filename}: Contains potentially dangerous operation`));
                    }
                }
                
                console.log(chalk.green(`✅ ${migration.filename}: Valid (${statements.length} statements)`));
                
            } catch (error) {
                console.error(chalk.red(`❌ ${migration.filename}: ${error.message}`));
                allValid = false;
            }
        }
        
        console.log(chalk.blue(`\n📊 Validation Summary:`));
        console.log(chalk.blue(`   Total files: ${migrations.length}`));
        console.log(allValid ? chalk.green('   Status: All files valid ✅') : chalk.red('   Status: Some files have issues ❌'));
        
        return allValid;
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'migrate';
    
    const runner = new MigrationRunner();
    
    // Connect to database (not required for validation)
    if (command !== 'validate') {
        const connected = await runner.connect();
        if (!connected) {
            process.exit(1);
        }
    }
    
    try {
        switch (command) {
            case 'migrate':
            case 'up':
                const migrateSuccess = await runner.runMigrations({
                    force: args.includes('--force'),
                    specific: args.find(arg => arg.startsWith('--file='))?.split('=')[1]
                });
                process.exit(migrateSuccess ? 0 : 1);
                break;
                
            case 'status':
                await runner.showStatus();
                break;
                
            case 'rollback':
                await runner.rollback();
                break;
                
            case 'seed':
                const seedSuccess = await runner.seedDevelopment();
                process.exit(seedSuccess ? 0 : 1);
                break;
                
            case 'reset':
                const resetSuccess = await runner.reset();
                process.exit(resetSuccess ? 0 : 1);
                break;

            case 'validate':
                const validateSuccess = await runner.validateMigrations();
                process.exit(validateSuccess ? 0 : 1);
                break;
                
            default:
                console.log(chalk.blue('📚 Real Estate Masterclass LMS - Migration Runner'));
                console.log(chalk.gray('Usage: node migration-runner.js [command] [options]'));
                console.log('');
                console.log(chalk.yellow('Commands:'));
                console.log('  migrate, up    Run pending migrations');
                console.log('  status         Show migration status');
                console.log('  rollback       Rollback last migration (manual)');
                console.log('  seed           Seed development data');
                console.log('  reset          Reset database and re-run all migrations');
                console.log('  validate       Validate migration files without executing');
                console.log('');
                console.log(chalk.yellow('Options:'));
                console.log('  --force        Force re-run all migrations');
                console.log('  --file=name    Run specific migration file');
                console.log('');
                console.log(chalk.yellow('Examples:'));
                console.log('  node migration-runner.js migrate');
                console.log('  node migration-runner.js status');
                console.log('  node migration-runner.js seed');
                console.log('  node migration-runner.js validate');
                console.log('  node migration-runner.js migrate --file=001_create_initial_schema.sql');
                break;
        }
        
    } catch (error) {
        console.error(chalk.red('❌ Unexpected error:'), error.message);
        process.exit(1);
    } finally {
        await runner.disconnect();
    }
}

// Export for programmatic use
export { MigrationRunner };

// Run CLI if called directly
if (process.argv[1] === __filename || process.argv[1].endsWith('migration-runner.js')) {
    main().catch(error => {
        console.error(chalk.red('❌ Fatal error:'), error.message);
        process.exit(1);
    });
}