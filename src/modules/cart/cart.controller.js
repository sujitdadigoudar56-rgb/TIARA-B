const asyncHandler = require('../../common/asyncHandler');
const cartService = require('./cart.service');

const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req);
  res.json(cart);
});

const addItem = asyncHandler(async (req, res) => {
  const cart = await cartService.addItem(req, req.body);
  res.status(201).json(cart);
});

const updateItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateItem(req, req.params.itemId, req.body.quantity);
  res.json(cart);
});

const removeItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItem(req, req.params.itemId);
  res.json(cart);
});

module.exports = { getCart, addItem, updateItem, removeItem };
