import { describe, expect, it } from 'vitest';
import { findPlaces, isBlank, loadWeather } from './search.js';

const VALENCIA_ES = { name: 'Valencia', country: 'ES', state: 'Comunidad Valenciana', lat: 39.47, lon: -0.38 };
const VALENCIA_VE = { name: 'Valencia', country: 'VE', state: 'Carabobo', lat: 10.16, lon: -68.0 };

describe('findPlaces', () => {
  it('devuelve todas las coincidencias', async () => {
    const api = { geocode: async () => [VALENCIA_ES, VALENCIA_VE] };
    await expect(findPlaces(api, 'Valencia')).resolves.toEqual([VALENCIA_ES, VALENCIA_VE]);
  });

  it('quita las coincidencias repetidas', async () => {
    const duplicate = { ...VALENCIA_ES, lat: 39.4699, lon: -0.3763 };
    const api = { geocode: async () => [VALENCIA_ES, duplicate, VALENCIA_VE] };
    await expect(findPlaces(api, 'Valencia')).resolves.toEqual([VALENCIA_ES, VALENCIA_VE]);
  });

  it('busca sin espacios sobrantes', async () => {
    const queries = [];
    const api = {
      geocode: async (q) => {
        queries.push(q);
        return [VALENCIA_ES];
      },
    };
    await findPlaces(api, '  Valencia ');
    expect(queries).toEqual(['Valencia']);
  });

  it('si no hay coincidencias lanza NOT_FOUND', async () => {
    const api = { geocode: async () => [] };
    await expect(findPlaces(api, 'Ciudadquenoexiste')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

describe('loadWeather', () => {
  it('pide el tiempo y la previsión con las coordenadas de la ciudad elegida', async () => {
    const calls = [];
    const api = {
      current: async (lat, lon) => {
        calls.push(['current', lat, lon]);
        return { temp: 28 };
      },
      forecast: async (lat, lon) => {
        calls.push(['forecast', lat, lon]);
        return [{ time: '2026-11-09T12:00:00.000Z', temp: 29, conditionId: 800, isNight: false, pop: 0.2 }];
      },
    };
    await expect(loadWeather(api, VALENCIA_VE)).resolves.toEqual({
      place: VALENCIA_VE,
      current: { temp: 28 },
      forecast: [{ time: new Date('2026-11-09T12:00:00.000Z'), temp: 29, conditionId: 800, isNight: false, pop: 0.2 }],
    });
    expect(calls).toEqual([
      ['current', 10.16, -68.0],
      ['forecast', 10.16, -68.0],
    ]);
  });

  it('si falla la previsión, devuelve el tiempo actual y forecast null', async () => {
    const api = {
      current: async () => ({ temp: 28 }),
      forecast: async () => {
        throw new Error('fallo');
      },
    };
    await expect(loadWeather(api, VALENCIA_VE)).resolves.toMatchObject({ current: { temp: 28 }, forecast: null });
  });

  it('si falla el tiempo actual, falla la carga', async () => {
    const api = {
      current: async () => {
        throw new Error('fallo');
      },
      forecast: async () => [],
    };
    await expect(loadWeather(api, VALENCIA_VE)).rejects.toThrow('fallo');
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
