import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createCacheRepo } from './cache-repo.js';
import { createPool } from './db.js';

// Necesita el Postgres de Docker: `docker compose up -d db` y `npm run test:db`.
const pool = createPool(process.env.DATABASE_URL);
const repo = createCacheRepo(pool);
const PREFIX = `test:${Date.now()}:`;

beforeAll(() => repo.migrate());

afterAll(async () => {
  await pool.query('DELETE FROM weather_cache WHERE key LIKE $1', [`${PREFIX}%`]);
  await pool.end();
});

describe('createCacheRepo (Postgres real)', () => {
  it('la migración se puede repetir sin error', async () => {
    await expect(repo.migrate()).resolves.toBeUndefined();
  });

  it('devuelve null si la clave no existe', async () => {
    await expect(repo.get(`${PREFIX}nada`)).resolves.toBeNull();
  });

  it('guarda y lee una respuesta con su hora', async () => {
    const fetchedAt = new Date('2026-11-09T10:00:00Z');
    await repo.set(`${PREFIX}madrid`, { temp: 21.4, list: [1, 2] }, fetchedAt);

    await expect(repo.get(`${PREFIX}madrid`)).resolves.toEqual({ body: { temp: 21.4, list: [1, 2] }, fetchedAt });
  });

  it('sobrescribe la respuesta anterior de la misma clave', async () => {
    await repo.set(`${PREFIX}bilbao`, { temp: 15 }, new Date('2026-11-09T10:00:00Z'));
    await repo.set(`${PREFIX}bilbao`, { temp: 16 }, new Date('2026-11-09T10:11:00Z'));

    await expect(repo.get(`${PREFIX}bilbao`)).resolves.toEqual({
      body: { temp: 16 },
      fetchedAt: new Date('2026-11-09T10:11:00Z'),
    });
  });
});
