// CommonJS Express server entry for Vercel to avoid ESM import issues
const express = require('express');
const cors = require('cors');
try { require('dotenv').config(); } catch (e) { /* ignore */ }

// db.js exports the pool instance (module.exports = pool) and also attaches a custom query helper
const pool = require('./db.js');
const { query } = require('./db.js');

const menuRoutes = require('./routes/menu.js').default || require('./routes/menu.js');
const orderRoutes = require('./routes/orders.js').default || require('./routes/orders.js');
const authRoutes = require('./routes/auth.js').default || require('./routes/auth.js');

const app = express();
const PORT = process.env.PORT || 3001;

// Dynamic CORS configuration (matching previous TypeScript logic)
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000'
];
const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
if (vercelUrl) defaultOrigins.push(vercelUrl);
const envAllowed = (process.env.CORS_ALLOWED || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envAllowed]));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await query('SELECT NOW()');
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message,
  });
});

// Export for Vercel serverless
module.exports = app;

// Local dev server (only when not production)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server (CJS) running on http://localhost:${PORT}`);
    console.log(`Database: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received: closing HTTP server');
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  });
}