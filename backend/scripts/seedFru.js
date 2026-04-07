/**
 * One-time: create first FRU user when no admin exists.
 * Usage: node scripts/seedFru.js you@example.com YourPassword123 "Full Name"
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const { User } = require('../models/User');

async function main() {
  const [email, password, fullName] = process.argv.slice(2);
  if (!email || !password || !fullName) {
    console.error('Usage: node scripts/seedFru.js <email> <password> <fullName>');
    process.exit(1);
  }
  await connectDB();
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log('User already exists:', email);
    process.exit(0);
  }
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);
  await User.create({
    email: email.toLowerCase(),
    password: hashed,
    fullName,
    role: 'FRU',
  });
  console.log('FRU user created:', email);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
