const { randomUUID } = require('crypto');
const { CART_COOKIE, cartCookieOptions } = require('../../common/cookies');

// Ensures every request (logged in or not) has a stable cart identity.
// Logged-in users are identified by req.user; guests get a cookie-backed uuid.
function attachCartId(req, res, next) {
  if (req.user) return next();

  let cartId = req.cookies[CART_COOKIE];
  if (!cartId) {
    cartId = randomUUID();
    res.cookie(CART_COOKIE, cartId, cartCookieOptions);
  }
  req.cartId = cartId;
  next();
}

module.exports = { attachCartId };
