import { describe, expect, it } from 'vitest';
import { createApi } from './api.js';

const respond = (status, body) => async () => ({
  ok: status < 400,
  status,
  json: async () => {
    if (body === undefined) throw new SyntaxError('no es JSON');
    return body;
  },
});

describe('createApi', () => {
  it('devuelve los datos si el servidor responde bien', async () => {
    const api = createApi(respond(200, { temp: 21.4 }));
    await expect(api.current(40.4, -3.7)).resolves.toEqual({ temp: 21.4 });
  });

  it('lanza un ApiError con el código que manda el servidor', async () => {
    const api = createApi(respond(502, { error: 'INVALID_KEY' }));
    await expect(api.current(1, 2)).rejects.toMatchObject({ name: 'ApiError', code: 'INVALID_KEY' });
  });

  it('si no se llega al servidor, lanza NETWORK', async () => {
    const api = createApi(async () => {
      throw new TypeError('Failed to fetch');
    });
    await expect(api.geocode('Madrid')).rejects.toMatchObject({ code: 'NETWORK' });
  });

  it('si la respuesta de error no es JSON (proxy caído), lanza NETWORK', async () => {
    const api = createApi(respond(500));
    await expect(api.geocode('Madrid')).rejects.toMatchObject({ code: 'NETWORK' });
  });
});
