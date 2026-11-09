import { createApp } from './app.js';
import { checkDb, createPool } from './db.js';

const port = Number(process.env.PORT ?? 3000);
const pool = createPool(process.env.DATABASE_URL);

const app = createApp({ checkDb: () => checkDb(pool) });

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
