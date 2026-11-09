import pg from 'pg';

export function createPool(connectionString) {
  return new pg.Pool({ connectionString });
}

export async function checkDb(pool) {
  await pool.query('SELECT 1');
}
