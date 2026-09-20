const Cart = require('./cart.model');
const Product = require('../products/product.model');
const ApiError = require('../../common/ApiError');

function ownerFilter(req) {
  if (req.user) return { userId: req.user._id };
  return { guestId: req.cartId };
}

async function getOrCreateCart(req) {
  const filter = ownerFilter(req);
  let cart = await Cart.findOne(filter);
  if (!cart) cart = await Cart.create(filter);
  return cart;
}

async function getCart(req) {
  const cart = await getOrCreateCart(req);
  return populate(cart);
}

async function addItem(req, { productId, size, quantity = 1 }) {
  if (!productId || !size) throw new ApiError(400, 'productId and size are required');
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, 'Product not found');

  const cart = await getOrCreateCart(req);
  const existing = cart.items.find((i) => i.product.toString() === productId && i.size === size);
  if (existing) existing.quantity += quantity;
  else cart.items.push({ product: productId, size, quantity });

  await cart.save();
  return populate(cart);
}

async function updateItem(req, itemId, quantity) {
  if (!quantity || quantity < 1) throw new ApiError(400, 'quantity must be at least 1');
  const cart = await getOrCreateCart(req);
  const item = cart.items.id(itemId);
  if (!item) throw new ApiError(404, 'Cart item not found');
  item.quantity = quantity;
  await cart.save();
  return populate(cart);
}

async function removeItem(req, itemId) {
  const cart = await getOrCreateCart(req);
  cart.items.pull({ _id: itemId });
  await cart.save();
  return populate(cart);
}

async function clearCart(req) {
  const cart = await getOrCreateCart(req);
  cart.items = [];
  await cart.save();
  return cart;
}

// Called right after login: folds the guest cart (by cookie) into the user's cart.
async function mergeGuestCartIntoUser(guestId, userId) {
  if (!guestId) return;
  const guestCart = await Cart.findOne({ guestId });
  if (!guestCart || guestCart.items.length === 0) return;

  let userCart = await Cart.findOne({ userId });
  if (!userCart) userCart = await Cart.create({ userId, items: [] });

  for (const item of guestCart.items) {
    const existing = userCart.items.find(
      (i) => i.product.toString() === item.product.toString() && i.size === item.size
    );
    if (existing) existing.quantity += item.quantity;
    else userCart.items.push({ product: item.product, size: item.size, quantity: item.quantity });
  }
  await userCart.save();
  await Cart.deleteOne({ _id: guestCart._id });
}

function populate(cart) {
  return cart.populate('items.product', 'title slug price compareAtPrice images');
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart, mergeGuestCartIntoUser, getOrCreateCart };
