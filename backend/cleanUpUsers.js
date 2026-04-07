require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./models/User');

async function cleanUpUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');
    
    // Keep only: admin@greentrace.gov (FRU), ngp@denr.gov.ph (NGP), mes@denr.gov.ph (MES)
    // Delete all others
    
    const usersToDelete = [
      'joelparino355@gmail.com',
      'fru@denr.gov.ph',  
      'mes@dennr.gov.ph'
    ];
    
    console.log('Deleting extra users...\n');
    
    for (const email of usersToDelete) {
      const result = await User.deleteOne({ email });
      if (result.deletedCount > 0) {
        console.log(`✅ Deleted: ${email}`);
      } else {
        console.log(`⚠️  Not found: ${email}`);
      }
    }
    
    // Update fru@denr.gov.ph to FRU role if it exists, or keep admin@greentrace.gov
    console.log('\nUpdating roles...\n');
    
    // Set admin as FRU
    const fruUser = await User.findOneAndUpdate(
      { email: 'admin@greentrace.gov' },
      { role: 'FRU' },
      { new: true }
    );
    
    if (fruUser) {
      console.log(`✅ FRU: ${fruUser.email} → ${fruUser.role}`);
    }
    
    // Set ngp@denr.gov.ph as NGP (keep default)
    const ngpUser = await User.findOneAndUpdate(
      { email: 'ngp@denr.gov.ph' },
      { role: 'NGP' },
      { new: true }
    );
    
    if (ngpUser) {
      console.log(`✅ NGP: ${ngpUser.email} → ${ngpUser.role}`);
    }
    
    // Set mes@denr.gov.ph as MES
    const mesUser = await User.findOneAndUpdate(
      { email: 'mes@denr.gov.ph' },
      { role: 'MES' },
      { new: true }
    );
    
    if (mesUser) {
      console.log(`✅ MES: ${mesUser.email} → ${mesUser.role}`);
    }
    
    console.log('\n=== Final User List (Should be 3 users) ===\n');
    const users = await User.find().select('email fullName role').sort('role');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Name: ${user.fullName}`);
      console.log('');
    });
    
    console.log(`Total users: ${users.length}`);
    console.log(users.length === 3 ? '\n✅ Perfect! Exactly 3 users.' : '\n⚠️  Warning: Not exactly 3 users!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

cleanUpUsers();
