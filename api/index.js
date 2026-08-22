const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('../server/src/routes/authRoutes');
const productRoutes = require('../server/src/routes/productRoutes');
const orderRoutes = require('../server/src/routes/orderRoutes');
const returnRoutes = require('../server/src/routes/returnRoutes');
const adminRoutes = require('../server/src/routes/adminRoutes');
const { logSystemEvent } = require('../server/src/middleware/auditLogger');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many attempts from this IP, please try again after 15 minutes.' }
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'Mini D-Mart Grocery API',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api', productRoutes);
app.use('/api', orderRoutes);
app.use('/api', returnRoutes);
app.use('/api', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `API route '${req.originalUrl}' not found.` });
});

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  logSystemEvent('SERVER_ERROR', `Error: ${err.message}`, req);
  res.status(500).json({ message: 'An unexpected internal server error occurred.' });
});

module.exports = app;
