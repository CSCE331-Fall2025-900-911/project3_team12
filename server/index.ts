import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool, { query } from './db';

//test 2
// Import routes
import menuRoutes from './routes/menu';
import orderRoutes from './routes/orders';
import authRoutes from './routes/auth';
import managersRoutes from './routes/managers';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://project3team12.vercel.app',
    'https://project3-team12.vercel.app',
    'project3team12ayadtest.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true
}));
app.use(express.json());

// Weather proxy route (available in the TypeScript server entry)
app.get('/api/weather', async (req: Request, res: Response) => {
  const key = process.env.WEATHER_API_KEY;
  if (!key) return res.status(500).json({ error: 'Missing WEATHER_API_KEY' });
  const { city, lat, lon } = req.query as Record<string, string>;
  let url: string;
  if (lat && lon) {
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&units=imperial&appid=${encodeURIComponent(key)}`;
  } else {
    const q = city ? city : process.env.WEATHER_DEFAULT_CITY || 'College Station';
    url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(q)}&units=imperial&appid=${encodeURIComponent(key)}`;
  }
  try {
    const r = await fetch(url);
    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).send(txt);
    }
    const data = await r.json();
    return res.status(200).json(data);
  } catch (err: any) {
    console.error('weather proxy error', err);
    return res.status(500).json({ error: 'Failed to fetch weather' });
  }
});

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Project 3 Team 12 API Server',
    status: 'running',
    endpoints: {
      health: '/api/health',
      menu: '/api/menu',
      orders: '/api/orders',
      auth: '/api/auth',
      managers: '/api/managers',
      weather: '/api/weather'
    }
  });
});

// Routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/managers', managersRoutes);

// Health check endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT NOW()');
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// Export for Vercel serverless
export default app;

// Start server for local development only
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Database: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  });
}
