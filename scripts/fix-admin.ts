import mysql from 'mysql2/promise';
import bcryptjs from 'bcryptjs';

async function fixAdminAccount() {
  let connection;
  
  try {
    // Database configuration - using same defaults as server
    const dbConfig = {
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '',
      database: 'masterclass_lms'
    };

    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // First, let's see current role structure
    console.log('📋 Current roles:');
    const [roles]: any = await connection.execute('SELECT * FROM roles ORDER BY id');
    roles.forEach((role: any) => {
      console.log(`  - ID: ${role.id}, Name: ${role.name}`);
    });

    // Find admin role ID
    const adminRole = roles.find((r: any) => r.name === 'admin');
    if (!adminRole) {
      console.log('❌ No admin role found!');
      return;
    }

    console.log(`🔍 Admin role ID: ${adminRole.id}`);

    // Check current user
    const [users]: any = await connection.execute(
      'SELECT id, name, email, role_id FROM users WHERE email = ?',
      ['jesrelagang94@gmail.com']
    );

    if (users.length === 0) {
      console.log('❌ Admin user not found!');
      return;
    }

    const user = users[0];
    console.log(`👤 Current user: ${user.name} (${user.email})`);
    console.log(`🏷️  Current role ID: ${user.role_id}`);

    // Update user role to correct admin role
    if (user.role_id !== adminRole.id) {
      console.log(`🔄 Updating user role from ${user.role_id} to ${adminRole.id}`);
      await connection.execute(
        'UPDATE users SET role_id = ? WHERE email = ?',
        [adminRole.id, 'jesrelagang94@gmail.com']
      );
      console.log('✅ Role updated successfully!');
    } else {
      console.log('✅ User already has correct admin role');
    }

    // Reset password to be sure
    const newPassword = 'Admin@123';
    const hashedPassword = await bcryptjs.hash(newPassword, 12);
    
    await connection.execute(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [hashedPassword, 'jesrelagang94@gmail.com']
    );

    console.log('✅ Password reset successfully!');
    console.log('=====================================');
    console.log('📧 Email: jesrelagang94@gmail.com');
    console.log('🔑 Password: Admin@123');
    console.log('🏷️  Role: admin');
    console.log('=====================================');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

console.log('🔧 Fixing Admin Account...');
fixAdminAccount();