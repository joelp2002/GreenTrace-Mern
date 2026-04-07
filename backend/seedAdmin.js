require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('./models/User');

const seedAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if FRU admin already exists
    const existingAdmin = await User.findOne({ role: 'FRU' });
    if (existingAdmin) {
      console.log('FRU admin already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create FRU admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@greentrace.gov';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.ADMIN_NAME || 'System Administrator';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const admin = await User.create({
      email: adminEmail,
      password: hashedPassword,
      fullName: adminName,
      role: 'FRU',
      organizationUnit: 'DENR Central Office'
    });

    console.log('✅ FRU admin user created successfully:');
    console.log('Email:', admin.email);
    console.log('Password:', adminPassword);
    console.log('Role:', admin.role);
    console.log('\nYou can now login with these credentials and create other FRU/MES users.');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin();
