const BASE_URL = 'https://api.openweathermap.org';

// Cliente de OpenWeatherMap. Solo lo usa el servidor: la clave nunca llega al navegador.
export function createOpenWeather({ apiKey, fetchFn = fetch }) {
  async function get(path, params) {
    const url = new URL(path, BASE_URL);
    for (const [key, value] of Object.entries({ ...params, appid: apiKey })) {
      url.searchParams.set(key, String(value));
    }
    const res = await fetchFn(url);
    return res.json();
  }

  return {
    async geocode(query) {
      const places = await get('/geo/1.0/direct', { q: query, limit: 5 });
      return places.map(toPlace);
    },
    async current(lat, lon) {
      const raw = await get('/data/2.5/weather', { lat, lon, units: 'metric' });
      return toCurrent(raw);
    },
  };
}

export function toPlace(raw) {
  return {
    name: raw.local_names?.es ?? raw.name,
    country: raw.country,
    state: raw.state ?? null,
    lat: raw.lat,
    lon: raw.lon,
  };
}

export function toCurrent(raw) {
  return { temp: raw.main.temp };
}
