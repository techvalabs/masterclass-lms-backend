import mysql from 'mysql2/promise';
import bcryptjs from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface DevUser {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  role_id: number;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
}

interface DevRole {
  id: number;
  name: string;
  description: string;
  permissions: string[];
}

class DevEnvironmentSetup {
  private dbConnected = false;
  private connection: mysql.Connection | null = null;

  async setup() {
    console.log('🚀 Setting up Development Environment for Masterclass LMS');
    console.log('===========================================================');

    // Try to connect to database
    await this.tryDatabaseConnection();

    if (this.dbConnected) {
      console.log('📊 Using MySQL Database Setup');
      await this.setupWithDatabase();
    } else {
      console.log('📁 Using File-Based Development Setup');
      await this.setupWithFiles();
    }

    console.log('✅ Development environment setup complete!');
    this.printLoginInstructions();
  }

  private async tryDatabaseConnection(): Promise<void> {
    const hosts = [
      process.env.DB_HOST || '172.23.160.1',
      '172.23.160.1',
      'localhost',
      '127.0.0.1',
      '10.255.255.254'
    ];

    const passwords = ['', '123456', 'root'];

    for (const host of hosts) {
      for (const password of passwords) {
        try {
          console.log(`🔄 Trying database connection: ${host} (password: '${password ? '***' : 'empty'}')`);
          
          this.connection = await mysql.createConnection({
            host,
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password,
            connectTimeout: 5000
          });

          console.log(`✅ Database connection successful: ${host}`);
          this.dbConnected = true;
          
          // Update .env file with working connection
          await this.updateEnvFile(host, password);
          return;

        } catch (error: any) {
          console.log(`❌ Connection failed: ${error.message}`);
        }
      }
    }

    console.log('⚠️  No database connection available - proceeding with file-based setup');
  }

  private async updateEnvFile(host: string, password: string): Promise<void> {
    try {
      const envPath = path.join(process.cwd(), '.env');
      const envContent = await fs.readFile(envPath, 'utf8');
      
      const updatedContent = envContent
        .replace(/DB_HOST=.*/, `DB_HOST=${host}`)
        .replace(/DB_PASSWORD=.*/, `DB_PASSWORD=${password}`);
      
      await fs.writeFile(envPath, updatedContent);
      console.log('📝 Updated .env file with working database connection');
    } catch (error) {
      console.log('⚠️  Could not update .env file:', error);
    }
  }

  private async setupWithDatabase(): Promise<void> {
    try {
      // Create database
      await this.connection!.execute(
        'CREATE DATABASE IF NOT EXISTS masterclass_lms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
      );
      console.log('✅ Database created/verified');

      // Use the database
      await this.connection!.execute('USE masterclass_lms');

      // Load and execute schema
      const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
      const schemaContent = await fs.readFile(schemaPath, 'utf8');
      
      // Split by semicolon and execute each statement
      const statements = schemaContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          await this.connection!.execute(statement);
        }
      }
      console.log('✅ Database schema loaded');

      // Create admin user
      await this.createAdminUser();

    } catch (error) {
      console.error('❌ Database setup error:', error);
      throw error;
    }
  }

  private async createAdminUser(): Promise<void> {
    const adminEmail = 'admin@masterclass.com';
    const adminPassword = 'Admin@123';
    const adminName = 'System Administrator';

    // Check/create admin role
    let [roles]: any = await this.connection!.execute(
      'SELECT id FROM roles WHERE name = ?',
      ['admin']
    );

    let adminRoleId = 3;
    if (roles.length === 0) {
      await this.connection!.execute(
        'INSERT INTO roles (id, name, description, permissions) VALUES (?, ?, ?, ?)',
        [3, 'admin', 'System Administrator', JSON.stringify(['*'])]
      );
      console.log('✅ Admin role created');
    } else {
      adminRoleId = roles[0].id;
    }

    // Check if admin exists
    const [existingUsers]: any = await this.connection!.execute(
      'SELECT id FROM users WHERE email = ?',
      [adminEmail]
    );

    if (existingUsers.length === 0) {
      const hashedPassword = await bcryptjs.hash(adminPassword, 12);
      
      await this.connection!.execute(
        `INSERT INTO users (name, email, password_hash, role_id, email_verified, is_active, created_at, updated_at) 
         VALUES (?, ?, ?, ?, 1, 1, NOW(), NOW())`,
        [adminName, adminEmail, hashedPassword, adminRoleId]
      );
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }
  }

  private async setupWithFiles(): Promise<void> {
    const dataDir = path.join(process.cwd(), 'data');
    
    // Ensure data directory exists
    await fs.mkdir(dataDir, { recursive: true });

    // Create roles file
    const roles: DevRole[] = [
      { id: 1, name: 'student', description: 'Student', permissions: ['read:courses', 'read:lessons'] },
      { id: 2, name: 'instructor', description: 'Instructor', permissions: ['read:courses', 'write:courses', 'read:lessons', 'write:lessons'] },
      { id: 3, name: 'admin', description: 'Administrator', permissions: ['*'] }
    ];

    await fs.writeFile(
      path.join(dataDir, 'roles.json'),
      JSON.stringify(roles, null, 2)
    );

    // Create admin user
    const adminPassword = await bcryptjs.hash('Admin@123', 12);
    const users: DevUser[] = [
      {
        id: 1,
        name: 'System Administrator',
        email: 'admin@masterclass.com',
        password_hash: adminPassword,
        role: 'admin',
        role_id: 3,
        is_active: true,
        email_verified: true,
        created_at: new Date().toISOString()
      }
    ];

    // Check if users file exists and merge
    const usersPath = path.join(dataDir, 'users.json');
    try {
      const existingUsers = JSON.parse(await fs.readFile(usersPath, 'utf8'));
      const adminExists = existingUsers.some((u: DevUser) => u.email === 'admin@masterclass.com');
      
      if (!adminExists) {
        users[0].id = existingUsers.length + 1;
        existingUsers.push(users[0]);
        await fs.writeFile(usersPath, JSON.stringify(existingUsers, null, 2));
      }
    } catch {
      await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
    }

    console.log('✅ Development files created');
    console.log(`📁 Data directory: ${dataDir}`);
  }

  private printLoginInstructions(): void {
    console.log('');
    console.log('🎯 Admin Login Instructions');
    console.log('============================');
    console.log('📧 Email: admin@masterclass.com');
    console.log('🔑 Password: Admin@123');
    console.log('');
    console.log('🌐 Frontend: http://localhost:5173');
    console.log('🔗 Backend: http://localhost:3001');
    console.log('📊 Admin Dashboard: http://localhost:5173/admin');
    console.log('');
    console.log('⚠️  Change the admin password after first login!');
  }

  async cleanup(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
    }
  }
}

// Main execution
async function main() {
  const setup = new DevEnvironmentSetup();
  
  try {
    await setup.setup();
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await setup.cleanup();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default DevEnvironmentSetup;