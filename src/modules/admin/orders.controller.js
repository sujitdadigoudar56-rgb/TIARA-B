const asyncHandler = require('../../common/asyncHandler');
const ApiError = require('../../common/ApiError');
const Order = require('../orders/order.model');

const list = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Order.find(filter).populate('userId', 'name email').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Order.countDocuments(filter),
  ]);
  res.json({ items, total, page: Number(page), limit: Number(limit) });
});

const get = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('userId', 'name email');
  if (!order) throw new ApiError(404, 'Order not found');
  res.json(order);
});

// Orders are created by checkout, not the admin panel — the only thing admins mutate is status.
const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'confirmed'].includes(status)) throw new ApiError(400, 'Invalid status');
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) throw new ApiError(404, 'Order not found');
  res.json(order);
});

const remove = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ ok: true });
});

module.exports = { list, get, updateStatus, remove };
