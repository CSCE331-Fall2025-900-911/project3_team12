// CommonJS DB pool wrapper so plain Node can require('./db')
try { require('dotenv').config(); } catch (e) { /* ignore */ }
const { Pool } = require('pg');

if (!process.env.DB_HOST && !process.env.DATABASE_URL) {
  console.warn('Warning: DB_HOST or DATABASE_URL not set. DB connections will fail without one.');
}

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, max: Number(process.env.PG_MAX_CLIENTS || 10), connectionTimeoutMillis: 5000 }
    : {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT || 5432),
        max: Number(process.env.PG_MAX_CLIENTS || 10),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
      }
);

pool.on('connect', () => console.log('Connected to PostgreSQL database'));
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.warn('Warning: DATABASE_URL not set. Your server will fail to connect to Postgres without it.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.PG_MAX_CLIENTS || 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  // If your DB requires SSL and has a valid cert, set rejectUnauthorized to true.
  ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
