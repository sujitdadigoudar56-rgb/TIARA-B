const Product = require('./product.model');
const ApiError = require('../../common/ApiError');

async function list({ category, bestseller, q, page = 1, limit = 24 }) {
  const filter = {};
  if (category) filter.category = category;
  if (bestseller === 'true') filter.isBestSeller = true;
  if (q) filter.title = { $regex: q, $options: 'i' };

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Product.countDocuments(filter),
  ]);
  return { items, total, page: Number(page), limit: Number(limit) };
}

async function getBySlug(slug) {
  const product = await Product.findOne({ slug });
  if (!product) throw new ApiError(404, 'Product not found');
  return product;
}

async function related(product, limit = 4) {
  return Product.find({ category: product.category, _id: { $ne: product._id } }).limit(limit);
}

module.exports = { list, getBySlug, related };
