const asyncHandler = require('../../common/asyncHandler');
const { TOKEN_COOKIE, CART_COOKIE, tokenCookieOptions } = require('../../common/cookies');
const authService = require('./auth.service');
const cartService = require('../cart/cart.service');

function setSession(res, user) {
  const token = authService.signToken(user);
  res.cookie(TOKEN_COOKIE, token, tokenCookieOptions);
}

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  setSession(res, user);
  const guestId = req.cookies[CART_COOKIE];
  if (guestId) await cartService.mergeGuestCartIntoUser(guestId, user._id);
  res.status(201).json({ user: authService.toPublicUser(user) });
});

const login = asyncHandler(async (req, res) => {
  const user = await authService.login(req.body);
  setSession(res, user);
  const guestId = req.cookies[CART_COOKIE];
  if (guestId) await cartService.mergeGuestCartIntoUser(guestId, user._id);
  res.json({ user: authService.toPublicUser(user) });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie(TOKEN_COOKIE);
  res.json({ ok: true });
});

const me = asyncHandler(async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not signed in' });
  res.json({ user: authService.toPublicUser(req.user) });
});

module.exports = { register, login, logout, me };
