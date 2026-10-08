const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { httpLogger } = require('./config/env');
const { errorHandler } = require('./middleware/error.middleware');

// Routes
const authRoutes = require('./modules/auth/auth.routes');
const productRoutes = require('./modules/products/products.routes');
const categoryRoutes = require('./modules/categories/categories.routes');
const brandRoutes = require('./modules/brands/brands.routes');
const cartRoutes = require('./modules/cart/cart.routes');
const addressRoutes = require('./modules/addresses/addresses.routes');
const checkoutRoutes = require('./modules/checkout/checkout.routes');
const orderRoutes = require('./modules/orders/orders.routes');
const paymentRoutes = require('./modules/payments/payments.routes');
const recommendationRoutes = require('./modules/recommendations/recommendations.routes');
const wishlistRoutes = require('./modules/wishlist/wishlist.routes');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(httpLogger);
}

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'bookworm-backend' }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/wishlist', wishlistRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', code: 'NOT_FOUND' });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
