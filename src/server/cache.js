export const CACHE_TTL_MS = 10 * 60 * 1000;

// Envuelve el cliente de OpenWeatherMap: el tiempo actual y la previsión de un mismo sitio
// se sirven desde Postgres durante 10 minutos. Si Postgres falla, se llama directamente.
export function withCache(weather, repo, { ttlMs = CACHE_TTL_MS, now = () => new Date(), logError = console.error } = {}) {
  async function cached(kind, lat, lon, fetchFresh) {
    const key = `${kind}:${lat.toFixed(2)}:${lon.toFixed(2)}`;

    try {
      const hit = await repo.get(key);
      if (hit && now().getTime() - hit.fetchedAt.getTime() < ttlMs) return hit.body;
    } catch (error) {
      logError(error);
    }

    const body = await fetchFresh();
    try {
      await repo.set(key, body, now());
    } catch (error) {
      logError(error);
    }
    return body;
  }

  return {
    geocode: (query) => weather.geocode(query),
    current: (lat, lon) => cached('current', lat, lon, () => weather.current(lat, lon)),
    // «-v2»: desde la fase 9 la previsión trae el cielo y la lluvia; así no se sirven respuestas antiguas sin ellos.
    forecast: (lat, lon) => cached('forecast-v2', lat, lon, () => weather.forecast(lat, lon)),
  };
}
