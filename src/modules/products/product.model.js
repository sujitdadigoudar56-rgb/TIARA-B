const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number, default: null },
    images: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    category: { type: String, required: true, trim: true },
    isBestSeller: { type: Boolean, default: false },
    stock: { type: Number, default: 100 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
