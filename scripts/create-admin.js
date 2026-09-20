// Creates (or promotes) an admin user. There's no admin self-registration flow on purpose.
// Usage: node scripts/create-admin.js <email> <password> [name]
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const env = require('../src/config/env');
const User = require('../src/modules/auth/auth.model');

async function run() {
  const [email, password, name = 'Admin'] = process.argv.slice(2);
  if (!email || !password) {
    console.error('Usage: node scripts/create-admin.js <email> <password> [name]');
    process.exit(1);
  }

  await mongoose.connect(env.mongodbUri);

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { $set: { role: 'admin', passwordHash, name }, $setOnInsert: { email: email.toLowerCase() } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`[create-admin] ${user.email} is now an admin`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('[create-admin] failed:', err);
  process.exit(1);
});
