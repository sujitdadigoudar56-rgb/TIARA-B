const mongoose = require('mongoose');
const env = require('./env');

// Caches the in-flight/completed connection promise so warm serverless invocations (and
// concurrent requests within one cold start) reuse the same connection instead of racing to
// open a new one each time. On failure the cache is cleared so the next call can retry —
// important on serverless, where a fixable issue (e.g. an Atlas IP allowlist change) shouldn't
// require a redeploy to recover from.
let connectionPromise = null;

function connectDB() {
  if (connectionPromise) return connectionPromise;

  mongoose.set('strictQuery', true);
  connectionPromise = mongoose
    .connect(env.mongodbUri)
    .then((conn) => {
      const safeUri = env.mongodbUri.replace(/\/\/[^@]+@/, '//<redacted>@');
      console.log(`[db] connected -> ${safeUri}`);
      return conn;
    })
    .catch((err) => {
      connectionPromise = null;
      throw err;
    });

  return connectionPromise;
}

module.exports = connectDB;
