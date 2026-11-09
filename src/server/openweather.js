const BASE_URL = 'https://api.openweathermap.org';

// 8 tramos de 3 horas = las próximas 24 horas.
export const FORECAST_STEPS = 8;

// Errores conocidos: INVALID_KEY (clave no válida), NETWORK (no se llega a OpenWeatherMap), UPSTREAM (otro fallo suyo).
export class WeatherError extends Error {
  constructor(code) {
    super(code);
    this.name = 'WeatherError';
    this.code = code;
  }
}

// Cliente de OpenWeatherMap. Solo lo usa el servidor: la clave nunca llega al navegador.
export function createOpenWeather({ apiKey, fetchFn = fetch }) {
  async function get(path, params) {
    const url = new URL(path, BASE_URL);
    for (const [key, value] of Object.entries({ ...params, appid: apiKey })) {
      url.searchParams.set(key, String(value));
    }
    let res;
    try {
      res = await fetchFn(url);
    } catch {
      throw new WeatherError('NETWORK');
    }
    if (res.status === 401) throw new WeatherError('INVALID_KEY');
    if (!res.ok) throw new WeatherError('UPSTREAM');
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
    async forecast(lat, lon) {
      const raw = await get('/data/2.5/forecast', { lat, lon, units: 'metric', cnt: FORECAST_STEPS });
      return toForecast(raw);
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
  const sky = raw.weather?.[0] ?? {};
  return {
    temp: raw.main.temp,
    feelsLike: raw.main.feels_like,
    humidity: raw.main.humidity,
    windSpeed: raw.wind?.speed ?? 0,
    conditionId: sky.id ?? null,
    description: sky.description ?? '',
    isNight: String(sky.icon ?? '').endsWith('n'),
    rain1h: raw.rain?.['1h'] ?? null,
  };
}

export function toForecast(raw) {
  return raw.list.slice(0, FORECAST_STEPS).map((step) => ({
    time: new Date(step.dt * 1000).toISOString(),
    temp: step.main.temp,
  }));
}
