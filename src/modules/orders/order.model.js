const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    title: { type: String, required: true },
    image: { type: String, default: '' },
    price: { type: Number, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const shippingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    guestId: { type: String, default: null },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true },
    shipping: { type: shippingSchema, required: true },
    status: { type: String, enum: ['pending', 'confirmed'], default: 'pending' },
    paymentMethod: { type: String, default: 'cod' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
