import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_this_in_production';

const payload = {
  userId: 1,
  email: 'admin@example.com',
  type: 'access'
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

console.log('Admin JWT Token:');
console.log(token);
console.log('\nSet in localStorage:');
console.log(`localStorage.setItem('adminToken', '${token}');`);