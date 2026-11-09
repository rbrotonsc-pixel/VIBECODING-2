import { describe, expect, it } from 'vitest';
import { createOpenWeather, toCurrent, toForecast } from './openweather.js';

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

    expect(current.temp).toBe(21.4);
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

describe('toCurrent', () => {
  it('se queda con los datos que muestra la página', () => {
    const raw = {
      main: { temp: 21.4, feels_like: 20.6, humidity: 40 },
      wind: { speed: 5 },
      weather: [{ id: 800, description: 'clear sky', icon: '01d' }],
    };
    expect(toCurrent(raw)).toEqual({
      temp: 21.4,
      feelsLike: 20.6,
      humidity: 40,
      windSpeed: 5,
      conditionId: 800,
      description: 'clear sky',
      isNight: false,
      rain1h: null,
    });
  });

  it('recoge la lluvia de la última hora y si es de noche', () => {
    const raw = {
      main: { temp: 12, feels_like: 11, humidity: 90 },
      wind: { speed: 2 },
      weather: [{ id: 500, description: 'light rain', icon: '10n' }],
      rain: { '1h': 0.42 },
    };
    expect(toCurrent(raw)).toMatchObject({ rain1h: 0.42, isNight: true, conditionId: 500 });
  });
});

describe('previsión', () => {
  const start = Date.UTC(2026, 10, 9, 12, 0, 0) / 1000;
  const list = Array.from({ length: 40 }, (_, i) => ({
    dt: start + i * 3 * 3600,
    main: { temp: 10 + i },
    weather: [{ id: 800, description: 'clear sky', icon: '01d' }],
    pop: 0.2,
  }));

  it('de 40 tramos se queda con los 8 primeros, con su hora', () => {
    const forecast = toForecast({ list });
    expect(forecast).toHaveLength(8);
    expect(forecast[0]).toMatchObject({ time: '2026-11-09T12:00:00.000Z', temp: 10 });
    expect(forecast[7]).toMatchObject({ time: '2026-11-10T09:00:00.000Z', temp: 17 });
  });

  it('cada tramo trae el cielo, si es de noche y la probabilidad de lluvia', () => {
    const night = { dt: start, main: { temp: 8 }, weather: [{ id: 500, description: 'light rain', icon: '10n' }], pop: 0.65 };
    expect(toForecast({ list: [night] })).toEqual([
      { time: '2026-11-09T12:00:00.000Z', temp: 8, conditionId: 500, description: 'light rain', isNight: true, pop: 0.65 },
    ]);
  });

  it('si falta la probabilidad de lluvia, es null', () => {
    const step = { dt: start, main: { temp: 8 }, weather: [] };
    expect(toForecast({ list: [step] })[0]).toMatchObject({ conditionId: null, isNight: false, pop: null });
  });

  it('pide la previsión con la clave, en métricas y solo 8 tramos', async () => {
    const calls = [];
    const fetchFn = async (url) => {
      calls.push(new URL(url));
      return { ok: true, status: 200, json: async () => ({ list }) };
    };
    const ow = createOpenWeather({ apiKey: 'clave-de-prueba', fetchFn });

    await expect(ow.forecast(40.4, -3.7)).resolves.toHaveLength(8);
    expect(calls[0].pathname).toBe('/data/2.5/forecast');
    expect(calls[0].searchParams.get('appid')).toBe('clave-de-prueba');
    expect(calls[0].searchParams.get('units')).toBe('metric');
    expect(calls[0].searchParams.get('cnt')).toBe('8');
  });
});
