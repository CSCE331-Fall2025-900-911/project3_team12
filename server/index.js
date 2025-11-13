// Load local .env for development (no-op in production if no file)
try { require('dotenv').config(); } catch (e) { /* ignore if dotenv not installed */ }
const express = require('express');
const cors = require('cors');

// Try to load the DB pool; if it's missing (e.g. not installed or file missing)
// we keep the server running so the weather endpoint still works locally.
let pool = null;
try {
  // eslint-disable-next-line global-require
  pool = require('./db');
} catch (err) {
  console.warn('Warning: could not load ./db pool — DB features will be disabled locally.', err && err.message ? err.message : err);
}

const app = express();
app.use(cors());
app.use(express.json());

// Weather proxy route (server-side)
app.get('/api/weather', async (req, res) => {
  const key = process.env.WEATHER_API_KEY;
  if (!key) return res.status(500).json({ error: 'Missing WEATHER_API_KEY' });
  const { city, lat, lon } = req.query;
  let url;
  if (lat && lon) {
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&units=imperial&appid=${encodeURIComponent(key)}`;
  } else {
    const q = city || 'College Station';
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
  } catch (err) {
    console.error('weather fetch error', err);
    return res.status(500).json({ error: 'Failed to fetch weather' });
  }
});

// Basic health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Create order
app.post('/api/orders', async (req, res) => {
  const body = req.body;
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  if (!body || !Array.isArray(body.items) || body.items.length === 0) {
    return res.status(400).json({ error: 'Invalid payload: items required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const totalCents = Math.round((body.total || 0) * 100);
    const orderRes = await client.query(
      'INSERT INTO orders (total_cents, status, customer_metadata) VALUES ($1,$2,$3) RETURNING id, created_at',
      [totalCents, 'pending', body.metadata || {}]
    );
    const orderId = orderRes.rows[0].id;

    const insertItem = 'INSERT INTO order_items (order_id, product_id, unit_price_cents, quantity, options) VALUES ($1,$2,$3,$4,$5)';
    for (const it of body.items) {
      await client.query(insertItem, [
        orderId,
        it.productId,
        Math.round((it.unitPrice || 0) * 100),
        it.quantity || 1,
        it.options || {},
      ]);
    }

    await client.query('COMMIT');
    return res.status(201).json({ orderId, status: 'pending', createdAt: orderRes.rows[0].created_at });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('create order error', err);
    return res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Get order by id
app.get('/api/orders/:id', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Missing id' });
  try {
    const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderRes.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const order = orderRes.rows[0];
    const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [id]);
    order.items = itemsRes.rows;
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API server listening on port ${PORT}`));
