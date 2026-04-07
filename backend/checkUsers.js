require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./models/User');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');
    
    const users = await User.find().select('email fullName role createdAt');
    
    console.log('=== All Users in Database ===\n');
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Name: ${user.fullName}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });
    
    console.log(`\nTotal users: ${users.length}`);
    
    // Check if FRU and MES users exist
    const fruUsers = users.filter(u => u.role === 'FRU');
    const mesUsers = users.filter(u => u.role === 'MES');
    const ngpUsers = users.filter(u => u.role === 'NGP');
    
    console.log(`\nRole Summary:`);
    console.log(`- FRU users: ${fruUsers.length}`);
    console.log(`- MES users: ${mesUsers.length}`);
    console.log(`- NGP users: ${ngpUsers.length}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkUsers();
