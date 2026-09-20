const asyncHandler = require('../../common/asyncHandler');
const orderService = require('./order.service');

const create = asyncHandler(async (req, res) => {
  const order = await orderService.createFromCart(req, req.body.shipping);
  res.status(201).json(order);
});

const getById = asyncHandler(async (req, res) => {
  const order = await orderService.getById(req.params.id);
  res.json(order);
});

module.exports = { create, getById };
