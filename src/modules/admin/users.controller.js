const bcrypt = require('bcryptjs');
const asyncHandler = require('../../common/asyncHandler');
const ApiError = require('../../common/ApiError');
const User = require('../auth/auth.model');

const list = asyncHandler(async (req, res) => {
  const { q, role, page = 1, limit = 20 } = req.query;
  const filter = {};
  // Legacy users predate the role field and have none stored at all, so an exact match on
  // 'customer' would miss them — $ne 'admin' catches those too (see dashboard.controller.js).
  if (role === 'admin') filter.role = 'admin';
  else if (role === 'customer') filter.role = { $ne: 'admin' };
  if (q) filter.$or = [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }];
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);
  res.json({ items, total, page: Number(page), limit: Number(limit) });
});

const get = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-passwordHash');
  if (!user) throw new ApiError(404, 'User not found');
  res.json(user);
});

// Lets an admin create another staff account directly (no self-registration flow for admins).
const create = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role = 'customer' } = req.body;
  if (!name || !email || !password) throw new ApiError(400, 'name, email and password are required');
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, 'An account with this email already exists');
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, phone, role });
  const { passwordHash: _omit, ...safe } = user.toObject();
  res.status(201).json(safe);
});

const update = asyncHandler(async (req, res) => {
  const { name, phone, role, password } = req.body;
  const updates = { name, phone, role };
  if (password) updates.passwordHash = await bcrypt.hash(password, 10);
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select(
    '-passwordHash'
  );
  if (!user) throw new ApiError(404, 'User not found');
  res.json(user);
});

const remove = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ ok: true });
});

module.exports = { list, get, create, update, remove };
