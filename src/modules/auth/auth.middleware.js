const { TOKEN_COOKIE } = require('../../common/cookies');
const { verifyToken } = require('./auth.service');
const User = require('./auth.model');

// Attaches req.user if a valid session cookie is present. Never blocks the request.
async function attachUser(req, res, next) {
  try {
    const token = req.cookies[TOKEN_COOKIE];
    if (!token) return next();
    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    if (user) req.user = user;
    next();
  } catch {
    next();
  }
}

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Sign in required' });
  next();
}

module.exports = { attachUser, requireAuth };
