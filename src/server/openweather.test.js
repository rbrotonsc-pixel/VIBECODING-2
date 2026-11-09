import { describe, expect, it } from 'vitest';
import { createOpenWeather } from './openweather.js';

function fakeFetch(body) {
  const calls = [];
  const fetchFn = async (url) => {
    calls.push(new URL(url));
    return { ok: true, status: 200, json: async () => body };
  };
  return { fetchFn, calls };
}

describe('createOpenWeather', () => {
  it('pide el tiempo actual con la clave y en unidades métricas', async () => {
    const { fetchFn, calls } = fakeFetch({ main: { temp: 21.4 } });
    const ow = createOpenWeather({ apiKey: 'clave-de-prueba', fetchFn });

    const current = await ow.current(40.4, -3.7);

    expect(current).toEqual({ temp: 21.4 });
    const url = calls[0];
    expect(url.origin + url.pathname).toBe('https://api.openweathermap.org/data/2.5/weather');
    expect(url.searchParams.get('appid')).toBe('clave-de-prueba');
    expect(url.searchParams.get('units')).toBe('metric');
    expect(url.searchParams.get('lat')).toBe('40.4');
    expect(url.searchParams.get('lon')).toBe('-3.7');
  });

  it('busca la ciudad con la clave y devuelve lugares simplificados', async () => {
    const { fetchFn, calls } = fakeFetch([
      { name: 'Madrid', local_names: { es: 'Madrid' }, country: 'ES', state: 'Comunidad de Madrid', lat: 40.4, lon: -3.7 },
      { name: 'London', local_names: { es: 'Londres' }, country: 'GB', lat: 51.5, lon: -0.1 },
      { name: 'Sin nombres', country: 'XX', lat: 1, lon: 2 },
    ]);
    const ow = createOpenWeather({ apiKey: 'clave-de-prueba', fetchFn });

    const places = await ow.geocode('Madrid');

    expect(calls[0].pathname).toBe('/geo/1.0/direct');
    expect(calls[0].searchParams.get('q')).toBe('Madrid');
    expect(calls[0].searchParams.get('appid')).toBe('clave-de-prueba');
    expect(places).toEqual([
      { name: 'Madrid', country: 'ES', state: 'Comunidad de Madrid', lat: 40.4, lon: -3.7 },
      { name: 'Londres', country: 'GB', state: null, lat: 51.5, lon: -0.1 },
      { name: 'Sin nombres', country: 'XX', state: null, lat: 1, lon: 2 },
    ]);
  });
});

describe('createOpenWeather: errores', () => {
  const respond = (status, body = {}) => async () => ({ ok: status < 400, status, json: async () => body });

  it('una clave no válida (401) da el error INVALID_KEY', async () => {
    const ow = createOpenWeather({ apiKey: 'mala', fetchFn: respond(401, { cod: 401 }) });
    await expect(ow.current(1, 2)).rejects.toMatchObject({ code: 'INVALID_KEY' });
  });

  it('cualquier otro error de OpenWeatherMap da el error UPSTREAM', async () => {
    const ow = createOpenWeather({ apiKey: 'k', fetchFn: respond(500) });
    await expect(ow.geocode('Madrid')).rejects.toMatchObject({ code: 'UPSTREAM' });
  });

  it('si no se puede conectar con OpenWeatherMap da el error NETWORK', async () => {
    const fetchFn = async () => {
      throw new TypeError('fetch failed');
    };
    const ow = createOpenWeather({ apiKey: 'k', fetchFn });
    await expect(ow.current(1, 2)).rejects.toMatchObject({ code: 'NETWORK' });
  });
});
