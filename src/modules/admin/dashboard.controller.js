const asyncHandler = require('../../common/asyncHandler');
const Order = require('../orders/order.model');
const Product = require('../products/product.model');
const User = require('../auth/auth.model');

const get = asyncHandler(async (req, res) => {
  const [productCount, orderCount, customerCount, revenueAgg, recentOrders, ordersByStatusAgg, lowStock] =
    await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      // $ne 'admin' (not $eq 'customer') so users created before the role field existed —
      // which have no role stored at all — still count as customers.
      User.countDocuments({ role: { $ne: 'admin' } }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.find().sort({ createdAt: -1 }).limit(5).select('total status shipping.name createdAt'),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Product.find({ stock: { $lt: 10 } }).sort({ stock: 1 }).limit(5).select('title slug stock'),
    ]);

  const ordersByStatus = Object.fromEntries(ordersByStatusAgg.map((s) => [s._id, s.count]));

  res.json({
    totals: {
      products: productCount,
      orders: orderCount,
      customers: customerCount,
      revenue: revenueAgg[0]?.total ?? 0,
    },
    ordersByStatus,
    recentOrders,
    lowStock,
  });
});

module.exports = { get };
