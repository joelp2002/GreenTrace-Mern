require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./models/User');

async function fixUserRoles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');
    
    // Update mes@denr.gov.ph to MES role
    const user1 = await User.findOneAndUpdate(
      { email: 'mes@denr.gov.ph' },
      { role: 'MES' },
      { new: true }
    );
    
    if (user1) {
      console.log(`✅ Updated ${user1.email} → Role: ${user1.role}`);
    } else {
      console.log('❌ User mes@denr.gov.ph not found');
    }
    
    // Update mes@dennr.gov.ph to MES role
    const user2 = await User.findOneAndUpdate(
      { email: 'mes@dennr.gov.ph' },
      { role: 'MES' },
      { new: true }
    );
    
    if (user2) {
      console.log(`✅ Updated ${user2.email} → Role: ${user2.role}`);
    } else {
      console.log('❌ User mes@dennr.gov.ph not found');
    }
    
    console.log('\n=== Updated User List ===');
    const users = await User.find().select('email fullName role');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} → ${user.role}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Done! Please try logging in again.');
  }
}

fixUserRoles();
