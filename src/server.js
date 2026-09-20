const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

async function start() {
  await connectDB();
  app.listen(env.port, () => console.log(`[server] TIARA backend is healthy and listening on port ${env.port}`));
}

start().catch((err) => {
  console.error('[server] failed to start:', err.message);
  process.exit(1);
});
