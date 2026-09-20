const mongoose = require('mongoose');

// Curated merchandising groups of products (e.g. "Summer 2026", "Best Sellers") — distinct from
// SiteContent.collections, which are just the homepage's decorative category tiles.
const collectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Collection', collectionSchema);
