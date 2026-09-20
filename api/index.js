// Vercel serverless entry point. `vercel.json` rewrites every request here; Express's own
// routing (mounted in src/app.js) then handles the actual path. Unlike src/server.js (which
// calls app.listen() for local/traditional hosting), this never binds a port — Vercel's Node
// runtime invokes this handler directly per request.
const app = require('../src/app');
const connectDB = require('../src/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[api] database connection failed:', err.message);
    res.status(503).json({ message: 'Database unavailable' });
    return;
  }
  app(req, res);
};
