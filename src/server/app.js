import express from 'express';

export function createApp({ checkDb, weather }) {
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
    res.json(await weather.geocode(String(req.query.q ?? '')));
  });

  app.get('/api/current', async (req, res) => {
    res.json(await weather.current(Number(req.query.lat), Number(req.query.lon)));
  });

  return app;
}
