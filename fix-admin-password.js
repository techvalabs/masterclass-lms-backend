// Fix admin password with fresh hash
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'masterclass_lms'
};

async function fixAdminPassword() {
    let connection;
    try {
        console.log('🔍 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');

        // Generate fresh password hash
        const password = 'Admin123!';
        console.log(`\n🔐 Generating fresh hash for password: ${password}`);
        const saltRounds = 12;
        const freshHash = await bcrypt.hash(password, saltRounds);
        console.log('🔑 Fresh hash generated:', freshHash);
        
        // Verify the fresh hash works
        const testHash = await bcrypt.compare(password, freshHash);
        console.log('✅ Fresh hash verification:', testHash ? 'SUCCESS' : 'FAILED');
        
        if (!testHash) {
            throw new Error('Fresh hash verification failed');
        }

        // Update admin user with fresh hash
        console.log('\n🔄 Updating admin user password...');
        const updateResult = await connection.execute(`
            UPDATE users 
            SET password_hash = ?, updated_at = NOW() 
            WHERE email = 'jesrelagang94@gmail.com'
        `, [freshHash]);
        
        console.log('✅ Password updated, affected rows:', updateResult[0].affectedRows);

        // Test login again
        console.log('\n🔐 Testing login with fresh hash...');
        const [users] = await connection.execute(`
            SELECT id, email, name, password_hash, role, is_active, email_verified_at
            FROM users WHERE email = ?
        `, ['jesrelagang94@gmail.com']);

        if (users.length === 0) {
            throw new Error('Admin user not found');
        }

        const user = users[0];
        console.log('👤 User found:', {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            is_active: !!user.is_active,
            email_verified_at: !!user.email_verified_at,
            password_length: user.password_hash?.length
        });

        // Final password verification
        const finalTest = await bcrypt.compare(password, user.password_hash);
        console.log(`\n🔑 Final password test for "${password}":`, finalTest ? '✅ SUCCESS' : '❌ FAILED');
        
        if (finalTest) {
            console.log('\n🎉 AUTHENTICATION FIXED!');
            console.log('📧 Login Email: jesrelagang94@gmail.com');
            console.log('🔒 Login Password: Admin123!');
            console.log('🏷️  Role: admin');
            console.log('\n🚀 You can now login to your LMS!');
        } else {
            console.log('\n❌ Still having issues with password verification');
            
            // Try alternative passwords
            const alternatives = ['password123', 'admin', 'admin123'];
            for (const alt of alternatives) {
                const altTest = await bcrypt.compare(alt, user.password_hash);
                if (altTest) {
                    console.log(`✅ Alternative password works: ${alt}`);
                    break;
                }
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code) {
            console.error('Error code:', error.code);
        }
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed');
        }
    }
}

fixAdminPassword();