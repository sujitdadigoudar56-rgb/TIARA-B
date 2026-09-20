const mongoose = require('mongoose');
const env = require('./env');

async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongodbUri);
  // Strip credentials before logging — mongodbUri may carry a password.
  const safeUri = env.mongodbUri.replace(/\/\/[^@]+@/, '//<redacted>@');
  console.log(`[db] connected -> ${safeUri}`);
}

module.exports = connectDB;
