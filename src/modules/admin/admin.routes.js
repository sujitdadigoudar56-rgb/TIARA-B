const express = require('express');
const { requireAdmin } = require('../auth/auth.middleware');

const router = express.Router();

// Every /api/admin/* route requires an authenticated admin — gated here so the module is
// self-contained regardless of how app.js mounts it.
router.use(requireAdmin);

router.use('/dashboard', require('./dashboard.routes'));
router.use('/products', require('./products.routes'));
router.use('/orders', require('./orders.routes'));
router.use('/users', require('./users.routes'));
router.use('/categories', require('./categories.routes'));
router.use('/collections', require('./collections.routes'));
router.use('/uploads', require('./uploads.routes'));

module.exports = router;
