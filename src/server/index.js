import { createApp } from './app.js';
import { checkDb, createPool } from './db.js';
import { createOpenWeather } from './openweather.js';

const port = Number(process.env.PORT ?? 3000);
const pool = createPool(process.env.DATABASE_URL);
const weather = createOpenWeather({ apiKey: process.env.OPENWEATHER_API_KEY });

const app = createApp({ checkDb: () => checkDb(pool), weather });

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
