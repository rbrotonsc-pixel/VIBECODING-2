import { describe, expect, it } from 'vitest';
import { searchWeather } from './search.js';

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
