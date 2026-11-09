import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';
import { WeatherError } from './openweather.js';

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

describe('errores de las rutas', () => {
  const failing = (error) => ({
    geocode: async () => {
      throw error;
    },
    current: async () => {
      throw error;
    },
  });

  it('una clave no válida responde 502 con el código INVALID_KEY, sin trazas', async () => {
    const app = createApp({ checkDb: okDb, weather: failing(new WeatherError('INVALID_KEY')) });
    const res = await request(app).get('/api/current?lat=1&lon=2');
    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: 'INVALID_KEY' });
  });

  it('un fallo de conexión responde 502 con el código NETWORK', async () => {
    const app = createApp({ checkDb: okDb, weather: failing(new WeatherError('NETWORK')) });
    const res = await request(app).get('/api/geocode?q=Madrid');
    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: 'NETWORK' });
  });

  it('un error inesperado responde 500 con el código INTERNAL, sin trazas', async () => {
    const app = createApp({
      checkDb: okDb,
      weather: failing(new TypeError('places.map is not a function')),
      logError: () => {},
    });
    const res = await request(app).get('/api/geocode?q=Madrid');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'INTERNAL' });
    expect(res.text).not.toContain('places.map');
  });

  it('una búsqueda vacía responde 400 sin llamar a OpenWeatherMap', async () => {
    const app = createApp({ checkDb: okDb, weather: failing(new Error('no debería llamarse')) });
    const res = await request(app).get('/api/geocode?q=%20%20');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'BAD_REQUEST' });
  });

  it('unas coordenadas no válidas responden 400', async () => {
    const app = createApp({ checkDb: okDb, weather: failing(new Error('no debería llamarse')) });
    const res = await request(app).get('/api/current?lat=abc&lon=2');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'BAD_REQUEST' });
  });
});
