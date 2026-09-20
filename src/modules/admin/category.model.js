const mongoose = require('mongoose');

// Product.category stores this slug as a plain string (unchanged, no migration needed) —
// this model exists so admins can manage the canonical list instead of typing free text.
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
