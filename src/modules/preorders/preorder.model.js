const mongoose = require('mongoose');

const preorderSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    countryCode: { type: String, default: '+91' },
    phone: { type: String, required: true, trim: true },
    age: { type: String, trim: true },
    gender: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Preorder', preorderSchema);
