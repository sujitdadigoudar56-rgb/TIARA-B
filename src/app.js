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

const app = express();

app.use(cors({ origin: env.clientOrigin, credentials: true }));
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

app.use(errorHandler);

module.exports = app;
