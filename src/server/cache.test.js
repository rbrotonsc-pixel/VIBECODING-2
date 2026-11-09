import { describe, expect, it } from 'vitest';
import { CACHE_TTL_MS, withCache } from './cache.js';

const MINUTE = 60 * 1000;

function memoryRepo() {
  const rows = new Map();
  return {
    rows,
    get: async (key) => rows.get(key) ?? null,
    set: async (key, body, fetchedAt) => {
      rows.set(key, { body, fetchedAt });
    },
  };
}

function countingWeather() {
  const calls = { current: 0, forecast: 0, geocode: 0 };
  return {
    calls,
    geocode: async () => {
      calls.geocode += 1;
      return [];
    },
    current: async (lat) => {
      calls.current += 1;
      return { temp: 20 + calls.current, lat };
    },
    forecast: async () => {
      calls.forecast += 1;
      return [{ time: '2026-11-09T12:00:00.000Z', temp: 25 }];
    },
  };
}

function setup({ repo = memoryRepo(), weather = countingWeather() } = {}) {
  let time = new Date('2026-11-09T10:00:00Z').getTime();
  const clock = {
    now: () => new Date(time),
    advance: (ms) => {
      time += ms;
    },
  };
  const errors = [];
  const cached = withCache(weather, repo, { now: clock.now, logError: (e) => errors.push(e) });
  return { cached, weather, repo, clock, errors };
}

describe('withCache', () => {
  it('la caché dura 10 minutos', () => {
    expect(CACHE_TTL_MS).toBe(10 * MINUTE);
  });

  it('dos peticiones en 5 minutos → 1 llamada; a los 11 minutos → 2', async () => {
    const { cached, weather, clock } = setup();

    await expect(cached.current(40.4, -3.7)).resolves.toEqual({ temp: 21, lat: 40.4 });
    clock.advance(5 * MINUTE);
    await expect(cached.current(40.4, -3.7)).resolves.toEqual({ temp: 21, lat: 40.4 });
    expect(weather.calls.current).toBe(1);

    clock.advance(6 * MINUTE);
    await expect(cached.current(40.4, -3.7)).resolves.toEqual({ temp: 22, lat: 40.4 });
    expect(weather.calls.current).toBe(2);
  });

  it('lugares distintos no comparten caché', async () => {
    const { cached, weather } = setup();
    await cached.current(40.4, -3.7);
    await cached.current(43.3, -2.9);
    expect(weather.calls.current).toBe(2);
  });

  it('la previsión también pasa por la caché, separada del tiempo actual', async () => {
    const { cached, weather, repo } = setup();
    await cached.forecast(40.4, -3.7);
    await cached.forecast(40.4, -3.7);
    await cached.current(40.4, -3.7);
    expect(weather.calls.forecast).toBe(1);
    expect(weather.calls.current).toBe(1);
    expect([...repo.rows.keys()].sort()).toEqual(['current:40.40:-3.70', 'forecast-v2:40.40:-3.70']);
  });

  it('la búsqueda de ciudades no se guarda en caché', async () => {
    const { cached, weather } = setup();
    await cached.geocode('Madrid');
    await cached.geocode('Madrid');
    expect(weather.calls.geocode).toBe(2);
  });

  it('si leer la caché falla, la respuesta llega igualmente', async () => {
    const repo = {
      get: async () => {
        throw new Error('Postgres caído');
      },
      set: async () => {
        throw new Error('Postgres caído');
      },
    };
    const { cached, weather, errors } = setup({ repo });
    await expect(cached.current(40.4, -3.7)).resolves.toEqual({ temp: 21, lat: 40.4 });
    expect(weather.calls.current).toBe(1);
    expect(errors).toHaveLength(2);
  });

  it('si guardar en la caché falla, la respuesta llega igualmente', async () => {
    const repo = {
      get: async () => null,
      set: async () => {
        throw new Error('Postgres caído');
      },
    };
    const { cached } = setup({ repo });
    await expect(cached.forecast(40.4, -3.7)).resolves.toHaveLength(1);
  });

  it('los errores de OpenWeatherMap no se guardan', async () => {
    const weather = countingWeather();
    weather.current = async () => {
      throw new Error('INVALID_KEY');
    };
    const { cached, repo } = setup({ weather });
    await expect(cached.current(40.4, -3.7)).rejects.toThrow('INVALID_KEY');
    expect(repo.rows.size).toBe(0);
  });
});
