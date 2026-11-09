import { describe, expect, it } from 'vitest';
import { isBlank, searchWeather } from './search.js';

describe('searchWeather', () => {
  it('usa la primera coincidencia y pide su tiempo con sus coordenadas', async () => {
    const calls = [];
    const api = {
      geocode: async () => [
        { name: 'Madrid', country: 'ES', lat: 40.4, lon: -3.7 },
        { name: 'Madrid', country: 'US', lat: 41.8, lon: -93.8 },
      ],
      current: async (lat, lon) => {
        calls.push([lat, lon]);
        return { temp: 21.4 };
      },
    };

    const result = await searchWeather(api, 'Madrid');

    expect(calls).toEqual([[40.4, -3.7]]);
    expect(result).toEqual({
      place: { name: 'Madrid', country: 'ES', lat: 40.4, lon: -3.7 },
      current: { temp: 21.4 },
    });
  });
});

describe('searchWeather: errores', () => {
  it('si no hay coincidencias lanza NOT_FOUND y no pide el tiempo', async () => {
    let currentCalls = 0;
    const api = {
      geocode: async () => [],
      current: async () => {
        currentCalls += 1;
      },
    };
    await expect(searchWeather(api, 'Ciudadquenoexiste')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(currentCalls).toBe(0);
  });
});

describe('isBlank', () => {
  it('detecta búsquedas vacías', () => {
    expect(isBlank('')).toBe(true);
    expect(isBlank('   ')).toBe(true);
    expect(isBlank(null)).toBe(true);
    expect(isBlank('Madrid')).toBe(false);
  });
});
