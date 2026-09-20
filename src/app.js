const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const errorHandler = require('./common/errorHandler');
const { attachUser } = require('./modules/auth/auth.middleware');
const { attachCartId } = require('./modules/cart/cart.middleware');

const authRoutes = require('./modules/auth/auth.routes');
const productRoutes = require('./modules/products/product.routes');
const cartRoutes = require('./modules/cart/cart.routes');
const orderRoutes = require('./modules/orders/order.routes');
const contactRoutes = require('./modules/contact/contact.routes');
const preorderRoutes = require('./modules/preorders/preorder.routes');
const siteContentRoutes = require('./modules/site-content/site-content.routes');
const adminRoutes = require('./modules/admin/admin.routes');

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // No Origin header (curl, server-to-server, same-origin) — allow.
      if (!origin || env.clientOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`Origin ${origin} not allowed`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(attachUser);
app.use(attachCartId);

app.get('/api/health', (req, res) => res.json({ ok: true, status: 'healthy', message: 'TIARA backend is up and running' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/preorders', preorderRoutes);
app.use('/api/site-content', siteContentRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

module.exports = app;
