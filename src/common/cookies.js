const env = require('../config/env');

const baseCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.nodeEnv === 'production',
};

const TOKEN_COOKIE = 'tiara_token';
const CART_COOKIE = 'tiara_cart_id';

const tokenCookieOptions = { ...baseCookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 }; // 30 days
const cartCookieOptions = { ...baseCookieOptions, maxAge: 90 * 24 * 60 * 60 * 1000 }; // 90 days

module.exports = { TOKEN_COOKIE, CART_COOKIE, tokenCookieOptions, cartCookieOptions };
