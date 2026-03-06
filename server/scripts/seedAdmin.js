const bcrypt = require('bcryptjs');
const { connectDB } = require('../config/db');
const { env } = require('../config/env');
const User = require('../models/User');

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Admin';

  if (!email || !password) {
    throw new Error('Missing ADMIN_EMAIL or ADMIN_PASSWORD in env');
  }

  if (!env.MONGO_URI) {
    throw new Error('Missing MONGO_URI in env');
  }

  await connectDB(env.MONGO_URI);

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = 'admin';
    if (name) existing.name = name;
    await existing.save();
    // eslint-disable-next-line no-console
    console.log(`Updated existing user to admin: ${email}`);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 12);
  await User.create({ name, email, password: hashed, role: 'admin' });
  // eslint-disable-next-line no-console
  console.log(`Created admin user: ${email}`);
  process.exit(0);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});

