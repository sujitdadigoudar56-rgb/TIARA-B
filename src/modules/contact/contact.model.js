const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contact', contactSchema);
