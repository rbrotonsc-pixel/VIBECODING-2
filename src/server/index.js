import { createApp } from './app.js';
import { withCache } from './cache.js';
import { createCacheRepo } from './cache-repo.js';
import { checkDb, createPool } from './db.js';
import { createOpenWeather } from './openweather.js';

const port = Number(process.env.PORT ?? 3000);
const pool = createPool(process.env.DATABASE_URL);
const repo = createCacheRepo(pool);

// Si Postgres no está listo, el servidor arranca igual y funciona sin caché.
try {
  await repo.migrate();
} catch (error) {
  console.error('No se ha podido preparar la caché en Postgres:', error.message);
}

const weather = withCache(createOpenWeather({ apiKey: process.env.OPENWEATHER_API_KEY }), repo);
const app = createApp({ checkDb: () => checkDb(pool), weather });

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
