import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';

describe('GET /api/health', () => {
  it('responde ok si Postgres contesta', async () => {
    const app = createApp({ checkDb: async () => {} });
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('responde 503 si Postgres no contesta', async () => {
    const app = createApp({
      checkDb: async () => {
        throw new Error('sin conexión');
      },
    });
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: 'error' });
  });
});
