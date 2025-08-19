// Generate fresh bcrypt hash for admin password
import bcrypt from 'bcryptjs';

async function generatePassword() {
    const password = 'Admin123!';
    const saltRounds = 12;
    
    console.log('🔐 Generating password hash for:', password);
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('🔑 Generated hash:', hash);
    
    // Test the hash immediately
    const isValid = await bcrypt.compare(password, hash);
    console.log('✅ Hash verification:', isValid ? 'SUCCESS' : 'FAILED');
    
    // Also test a simpler password
    const simplePassword = 'password123';
    const simpleHash = await bcrypt.hash(simplePassword, saltRounds);
    console.log('\n🔐 Simple password hash for:', simplePassword);
    console.log('🔑 Generated hash:', simpleHash);
    
    const simpleValid = await bcrypt.compare(simplePassword, simpleHash);
    console.log('✅ Simple hash verification:', simpleValid ? 'SUCCESS' : 'FAILED');
}

generatePassword();