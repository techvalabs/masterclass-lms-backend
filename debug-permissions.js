import mysql from 'mysql2/promise';

async function checkPermissions() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'real_estate_lms'
  });

  try {
    const [rows] = await connection.execute(`
      SELECT u.id, u.email, u.name, r.name as role, r.permissions, LENGTH(r.permissions) as permissions_length
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = 17
    `);

    console.log('User data:');
    console.log(JSON.stringify(rows[0], null, 2));
    
    const permissions = rows[0].permissions;
    console.log('\nRaw permissions string:');
    console.log(permissions);
    
    console.log('\nFirst 100 characters of permissions:');
    console.log(permissions.substring(0, 100));
    
    console.log('\nLast 100 characters of permissions:');
    console.log(permissions.substring(permissions.length - 100));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkPermissions();