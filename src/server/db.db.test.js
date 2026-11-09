import { afterAll, describe, expect, it } from 'vitest';
import { checkDb, createPool } from './db.js';

// Necesita el Postgres de Docker: `docker compose up -d db` y `npm run test:db`.
const pool = createPool(process.env.DATABASE_URL);

afterAll(() => pool.end());

describe('checkDb (Postgres real)', () => {
  it('conecta con la base de datos', async () => {
    await expect(checkDb(pool)).resolves.toBeUndefined();
  });
});
