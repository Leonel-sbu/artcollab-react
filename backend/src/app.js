require('dotenv').config();
require('express-async-errors');
require('./utils/env');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const artworkRoutes = require('./routes/artworkRoutes');

// New module routes (scaffold)
const courseRoutes = require('./routes/courseRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const messageRoutes = require('./routes/messageRoutes');
const adminRoutes = require('./routes/adminRoutes');
const stripeRoutes = require('./routes/stripeRoutes');


const stripeController = require('./controllers/stripeController');
const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
// Stripe webhook MUST use raw body (must be BEFORE express.json)
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), stripeController.webhook);

app.use(express.json({ limit: '10mb' }));app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', time: new Date().toISOString() });
});

// Existing
app.use('/api/auth', authRoutes);
app.use('/api/artworks', artworkRoutes);

// New
app.use('/api/courses', courseRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', stripeRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

// Cart & Orders


// Messaging


// Admin






