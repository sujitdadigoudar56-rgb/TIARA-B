const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const ApiError = require('../../common/ApiError');
const User = require('./auth.model');

async function register({ name, email, password, phone }) {
  if (!name || !email || !password) throw new ApiError(400, 'name, email and password are required');
  if (password.length < 6) throw new ApiError(400, 'password must be at least 6 characters');

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, phone });
  return user;
}

async function login({ email, password }) {
  if (!email || !password) throw new ApiError(400, 'email and password are required');

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw new ApiError(401, 'Invalid email or password');

  return user;
}

function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, env.jwtSecret, { expiresIn: '30d' });
}

function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

function toPublicUser(user) {
  return { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role };
}

module.exports = { register, login, signToken, verifyToken, toPublicUser };
