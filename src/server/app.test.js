import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';

const okDb = async () => {};

describe('GET /api/health', () => {
  it('responde ok si Postgres contesta', async () => {
    const app = createApp({ checkDb: okDb });
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

describe('rutas del tiempo', () => {
  it('GET /api/geocode pasa la búsqueda al cliente', async () => {
    const queries = [];
    const weather = {
      geocode: async (q) => {
        queries.push(q);
        return [{ name: 'Madrid', country: 'ES', state: null, lat: 40.4, lon: -3.7 }];
      },
    };
    const res = await request(createApp({ checkDb: okDb, weather })).get('/api/geocode?q=Madrid');
    expect(res.status).toBe(200);
    expect(queries).toEqual(['Madrid']);
    expect(res.body[0].name).toBe('Madrid');
  });

  it('GET /api/current pasa las coordenadas como números', async () => {
    const calls = [];
    const weather = {
      current: async (lat, lon) => {
        calls.push([lat, lon]);
        return { temp: 21.4 };
      },
    };
    const res = await request(createApp({ checkDb: okDb, weather })).get('/api/current?lat=40.4&lon=-3.7');
    expect(res.status).toBe(200);
    expect(calls).toEqual([[40.4, -3.7]]);
    expect(res.body).toEqual({ temp: 21.4 });
  });
});
