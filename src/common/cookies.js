const env = require('../config/env');

// Cross-site (frontend and backend on different domains, e.g. tiara-a.vercel.app calling
// tiara-b.vercel.app) requires SameSite=None + Secure, or browsers silently drop the cookie on
// every fetch() after it's set — login succeeds but every subsequent authenticated call 401s.
// Local dev is same-site (different localhost ports) and plain HTTP, where Lax + non-Secure is
// both correct and required (Secure cookies are refused entirely over HTTP).
const baseCookieOptions = {
  httpOnly: true,
  sameSite: env.isVercel ? 'none' : 'lax',
  secure: env.isVercel,
};

const TOKEN_COOKIE = 'tiara_token';
const CART_COOKIE = 'tiara_cart_id';

const tokenCookieOptions = { ...baseCookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 }; // 30 days
const cartCookieOptions = { ...baseCookieOptions, maxAge: 90 * 24 * 60 * 60 * 1000 }; // 90 days

module.exports = { TOKEN_COOKIE, CART_COOKIE, tokenCookieOptions, cartCookieOptions };
