import { Pool } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

function createPool() {
  const url = process.env.DATABASE_URL;
  if (url) {
    return new Pool({
      connectionString: url,
      max: Number(process.env.PG_MAX_CLIENTS || 10),
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });
  }
  return new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 5432),
    max: Number(process.env.PG_MAX_CLIENTS || 10),
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });
}

export const pool: Pool = global.__pgPool ?? createPool();
if (!global.__pgPool) global.__pgPool = pool;
