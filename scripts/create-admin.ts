import mysql from 'mysql2/promise';
import bcryptjs from 'bcryptjs';

async function createAdminAccount() {
  let connection;
  
  try {
    // Database configuration - using same defaults as server
    const dbConfig = {
      host: process.env.DB_HOST || '172.23.160.1',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'masterclass_lms'
    };

    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Check if admin role exists, if not create it
    console.log('📝 Checking admin role...');
    const [roles]: any = await connection.execute(
      'SELECT id FROM roles WHERE name = ?',
      ['admin']
    );

    let adminRoleId = 3;
    if (roles.length === 0) {
      console.log('📝 Creating admin role...');
      const [result]: any = await connection.execute(
        'INSERT INTO roles (id, name, description) VALUES (?, ?, ?)',
        [3, 'admin', 'System Administrator']
      );
      adminRoleId = result.insertId || 3;
      console.log('✅ Admin role created');
    } else {
      adminRoleId = roles[0].id;
      console.log('✅ Admin role already exists');
    }

    // Get admin details from command line or use defaults
    const adminEmail = process.argv[2] || 'admin@masterclass.com';
    const adminPassword = process.argv[3] || 'Admin@123';
    const adminName = process.argv[4] || 'System Administrator';

    // Check if admin already exists
    const [existingUsers]: any = await connection.execute(
      'SELECT id, name, email FROM users WHERE email = ?',
      [adminEmail]
    );

    if (existingUsers.length > 0) {
      console.log(`⚠️  User with email ${adminEmail} already exists`);
      console.log('🔄 Updating user to admin role...');
      
      await connection.execute(
        'UPDATE users SET role_id = ? WHERE email = ?',
        [adminRoleId, adminEmail]
      );
      
      console.log('✅ User updated to admin successfully!');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Use your existing password to login`);
    } else {
      // Hash the password
      console.log('🔐 Hashing password...');
      const hashedPassword = await bcryptjs.hash(adminPassword, 12);

      // Create admin user
      console.log('👤 Creating admin user...');
      const [result]: any = await connection.execute(
        `INSERT INTO users (name, email, password_hash, role_id, email_verified, is_active, created_at, updated_at) 
         VALUES (?, ?, ?, ?, 1, 1, NOW(), NOW())`,
        [adminName, adminEmail, hashedPassword, adminRoleId]
      );

      console.log('✅ Admin account created successfully!');
      console.log('=====================================');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Password: ${adminPassword}`);
      console.log(`👤 Name: ${adminName}`);
      console.log(`🆔 User ID: ${result.insertId}`);
      console.log('=====================================');
      console.log('⚠️  Please change the password after first login!');
    }

  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Show usage
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Usage: npx tsx scripts/create-admin.ts [email] [password] [name]

Examples:
  npx tsx scripts/create-admin.ts
  - Creates admin with default email: admin@masterclass.com, password: Admin@123

  npx tsx scripts/create-admin.ts jesrelagang94@gmail.com MyPassword123 "Jesrel Admin"
  - Creates admin with custom credentials

  npx tsx scripts/create-admin.ts jesrelagang94@gmail.com
  - Updates existing user to admin role
`);
  process.exit(0);
}

// Run the script
console.log('🚀 Real Estate Masterclass LMS - Admin Account Creator');
console.log('=====================================================');
createAdminAccount();