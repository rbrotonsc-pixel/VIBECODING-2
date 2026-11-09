import express from 'express';

export function createApp({ checkDb }) {
  const app = express();

  app.get('/api/health', async (_req, res) => {
    try {
      await checkDb();
      res.json({ status: 'ok' });
    } catch {
      res.status(503).json({ status: 'error' });
    }
  });

  return app;
}
