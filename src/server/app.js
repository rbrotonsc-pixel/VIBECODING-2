import express from 'express';
import { WeatherError } from './openweather.js';

const STATUS_BY_CODE = { INVALID_KEY: 502, NETWORK: 502, UPSTREAM: 502 };

class BadRequest extends Error {}

function coords(query) {
  const lat = Number(query.lat);
  const lon = Number(query.lon);
  if (query.lat === undefined || query.lon === undefined || !Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new BadRequest();
  }
  return { lat, lon };
}

export function createApp({ checkDb, weather, logError = console.error }) {
  const app = express();

  app.get('/api/health', async (_req, res) => {
    try {
      await checkDb();
      res.json({ status: 'ok' });
    } catch {
      res.status(503).json({ status: 'error' });
    }
  });

  app.get('/api/geocode', async (req, res) => {
    const query = String(req.query.q ?? '').trim();
    if (!query) throw new BadRequest();
    res.json(await weather.geocode(query));
  });

  app.get('/api/current', async (req, res) => {
    const { lat, lon } = coords(req.query);
    res.json(await weather.current(lat, lon));
  });

  app.get('/api/forecast', async (req, res) => {
    const { lat, lon } = coords(req.query);
    res.json(await weather.forecast(lat, lon));
  });

  // Nunca se devuelven trazas al navegador: solo un código de error.
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err instanceof BadRequest) return res.status(400).json({ error: 'BAD_REQUEST' });
    if (err instanceof WeatherError) return res.status(STATUS_BY_CODE[err.code] ?? 502).json({ error: err.code });
    logError(err);
    return res.status(500).json({ error: 'INTERNAL' });
  });

  return app;
}
