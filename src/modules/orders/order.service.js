const Order = require('./order.model');
const cartService = require('../cart/cart.service');
const ApiError = require('../../common/ApiError');

const REQUIRED_SHIPPING_FIELDS = ['name', 'phone', 'address', 'city', 'state', 'pincode'];

async function createFromCart(req, shipping) {
  for (const field of REQUIRED_SHIPPING_FIELDS) {
    if (!shipping?.[field]) throw new ApiError(400, `shipping.${field} is required`);
  }

  const cart = await cartService.getCart(req);
  if (!cart.items.length) throw new ApiError(400, 'Cart is empty');

  const items = cart.items.map((item) => ({
    product: item.product._id,
    title: item.product.title,
    image: item.product.images?.[0] || '',
    price: item.product.compareAtPrice ? item.product.price : item.product.price,
    size: item.size,
    quantity: item.quantity,
  }));
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const order = await Order.create({
    userId: req.user?._id || null,
    guestId: req.user ? null : req.cartId,
    items,
    total,
    shipping,
  });

  await cartService.clearCart(req);
  return order;
}

async function getById(id) {
  const order = await Order.findById(id);
  if (!order) throw new ApiError(404, 'Order not found');
  return order;
}

module.exports = { createFromCart, getById };
