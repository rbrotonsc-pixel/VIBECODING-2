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
  it('pide el tiempo con las coordenadas de la ciudad elegida', async () => {
    const calls = [];
    const api = {
      current: async (lat, lon) => {
        calls.push([lat, lon]);
        return { temp: 28 };
      },
    };
    await expect(loadWeather(api, VALENCIA_VE)).resolves.toEqual({ place: VALENCIA_VE, current: { temp: 28 } });
    expect(calls).toEqual([[10.16, -68.0]]);
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
