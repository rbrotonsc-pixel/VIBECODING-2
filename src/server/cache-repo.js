// Acceso a la tabla de caché en Postgres.
export function createCacheRepo(pool) {
  return {
    async migrate() {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS weather_cache (
          key TEXT PRIMARY KEY,
          body JSONB NOT NULL,
          fetched_at TIMESTAMPTZ NOT NULL
        )
      `);
    },

    async get(key) {
      const { rows } = await pool.query('SELECT body, fetched_at FROM weather_cache WHERE key = $1', [key]);
      if (rows.length === 0) return null;
      return { body: rows[0].body, fetchedAt: rows[0].fetched_at };
    },

    async set(key, body, fetchedAt) {
      await pool.query(
        `INSERT INTO weather_cache (key, body, fetched_at) VALUES ($1, $2, $3)
         ON CONFLICT (key) DO UPDATE SET body = EXCLUDED.body, fetched_at = EXCLUDED.fetched_at`,
        [key, JSON.stringify(body), fetchedAt],
      );
    },
  };
}
