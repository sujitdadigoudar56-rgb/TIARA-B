const asyncHandler = require('../../common/asyncHandler');
const productService = require('./product.service');

const list = asyncHandler(async (req, res) => {
  const result = await productService.list(req.query);
  res.json(result);
});

const getBySlug = asyncHandler(async (req, res) => {
  const product = await productService.getBySlug(req.params.slug);
  const relatedProducts = await productService.related(product);
  res.json({ product, related: relatedProducts });
});

module.exports = { list, getBySlug };
