require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('./models/User');

async function fixUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');
    
    // Delete admin user
    await User.deleteOne({ email: 'admin@greentrace.gov' });
    console.log('✅ Deleted admin@greentrace.gov');
    
    // Check if fru@denr.gov.ph exists, if not create it
    const fruExists = await User.findOne({ email: 'fru@denr.gov.ph' });
    if (!fruExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('fru123', salt);
      
      await User.create({
        email: 'fru@denr.gov.ph',
        password: hashedPassword,
        fullName: 'FRU Officer',
        role: 'FRU',
        organizationUnit: 'DENR'
      });
      console.log('✅ Created FRU user: fru@denr.gov.ph (password: fru123)');
    } else {
      // Update to FRU role if exists
      await User.findOneAndUpdate(
        { email: 'fru@denr.gov.ph' },
        { role: 'FRU' }
      );
      console.log('✅ Updated fru@denr.gov.ph to FRU role');
    }
    
    // Ensure ngp@denr.gov.ph has NGP role
    await User.findOneAndUpdate(
      { email: 'ngp@denr.gov.ph' },
      { role: 'NGP' }
    );
    console.log('✅ Updated ngp@denr.gov.ph to NGP role');
    
    // Ensure mes@denr.gov.ph has MES role (full access admin)
    await User.findOneAndUpdate(
      { email: 'mes@denr.gov.ph' },
      { role: 'MES' }
    );
    console.log('✅ Updated mes@denr.gov.ph to MES role (full access)');
    
    console.log('\n=== Final User List (3 users) ===\n');
    const users = await User.find().select('email fullName role').sort('role');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Name: ${user.fullName}`);
      console.log('');
    });
    
    console.log(`Total users: ${users.length}`);
    console.log('\n✅ MES user has full admin access');
    console.log('Login credentials:');
    console.log('- FRU: fru@denr.gov.ph / fru123');
    console.log('- NGP: ngp@denr.gov.ph / (existing password)');
    console.log('- MES: mes@denr.gov.ph / (existing password)');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

fixUsers();
