require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('../models/User');

async function createFirstAdmin() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('MONGODB_URI is required in .env');
    process.exit(1);
  }

  const email = process.env.BOOTSTRAP_ADMIN_EMAIL || 'admin@greentrace.com';
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || 'admin12345';
  const fullName = process.env.BOOTSTRAP_ADMIN_FULL_NAME || 'System Admin';
  const organizationUnit =
    process.env.BOOTSTRAP_ADMIN_ORG_UNIT || 'System Administration';

  try {
    await mongoose.connect(mongoUri);

    const existingAdmin = await User.findOne({ role: 'ADMIN' });
    if (existingAdmin) {
      console.log(`ADMIN already exists: ${existingAdmin.email}`);
      return;
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      console.error(
        `Cannot bootstrap ADMIN because email already exists as ${existingEmail.role}: ${existingEmail.email}`
      );
      process.exitCode = 1;
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await User.create({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      fullName: fullName.trim(),
      role: 'ADMIN',
      organizationUnit: organizationUnit.trim(),
    });

    console.log('ADMIN bootstrap completed');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${password}`);
    console.log(`Role: ${admin.role}`);
  } catch (error) {
    console.error('Failed to create ADMIN:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createFirstAdmin();
