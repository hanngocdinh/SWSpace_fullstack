// English: Simple PostgreSQL pool configuration used by userapi repositories
// Vietnamese: Cấu hình kết nối PostgreSQL dùng cho các repository trong userapi

const { Pool } = require('pg');

let pool;

function getPgPool() {
  if (pool) return pool;
  // Prefer primary DB_* env vars (used by config/database.js). Fallback to DATABASE_URL, then PG* vars.
  const useDiscrete = process.env.DB_HOST || process.env.DB_USER || process.env.DB_PASSWORD || process.env.DB_NAME;
  const hasUrl = !!process.env.DATABASE_URL && !useDiscrete;
  const config = hasUrl
    ? {
        connectionString: process.env.DATABASE_URL,
        max: parseInt(process.env.PGPOOL_MAX || '10', 10),
        idleTimeoutMillis: parseInt(process.env.PG_IDLE || '30000', 10),
        connectionTimeoutMillis: parseInt(process.env.PG_CONN_TIMEOUT || '5000', 10),
      }
    : {
        host:
          process.env.DB_HOST ||
          process.env.PGHOST ||
          process.env.POSTGRES_HOST ||
          'localhost',
        port: parseInt(
          process.env.DB_PORT ||
            process.env.PGPORT ||
            process.env.POSTGRES_PORT ||
            '5432',
          10
        ),
        user:
          process.env.DB_USER ||
          process.env.PGUSER ||
          process.env.POSTGRES_USER ||
          'postgres',
        password:
          process.env.DB_PASSWORD ||
          process.env.PGPASSWORD ||
          process.env.POSTGRES_PASSWORD ||
          'postgres',
        database:
          process.env.DB_NAME ||
          process.env.PGDATABASE ||
          process.env.POSTGRES_DB ||
          'swspace',
        max: parseInt(process.env.PGPOOL_MAX || '10', 10),
        idleTimeoutMillis: parseInt(process.env.PG_IDLE || '30000', 10),
        connectionTimeoutMillis: parseInt(process.env.PG_CONN_TIMEOUT || '5000', 10),
      };
  pool = new Pool(config);
  return pool;
}

// Test helper: allow tests to inject a mock pool
function __setPgPool(mockPool) {
  pool = mockPool;
}

module.exports = { getPgPool, __setPgPool };
