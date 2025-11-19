// CommonJS DB pool wrapper so plain Node can require('./db')
try { require('dotenv').config(); } catch (e) { /* ignore */ }
const { Pool } = require('pg');

const maxClients = Number(process.env.PG_MAX_CLIENTS || 10);
let pool = null;
let configured = false;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: maxClients,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });
  configured = true;
} else if (process.env.DB_HOST) {
  pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 5432),
    max: maxClients,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });
  configured = true;
} else {
  console.warn('Warning: No DATABASE_URL or DB_HOST provided. Database queries will fail until configured.');
}

if (configured && pool) {
  pool.on('connect', () => console.log('Connected to PostgreSQL database'));
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    // Do NOT exit the process in serverless environments; just log the error.
  });
}

// Helper query function that fails clearly when DB is not configured
async function query(text, params) {
  if (!configured || !pool) {
    const msg = 'Database not configured. Set DATABASE_URL or DB_HOST/DB_USER/DB_PASSWORD/DB_NAME in environment.';
    console.error(msg);
    throw new Error(msg);
  }
  return pool.query(text, params);
}

module.exports = pool;
module.exports.query = query;
