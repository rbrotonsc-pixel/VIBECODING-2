// Llamadas de la página al servidor propio (/api). La página nunca habla directamente con OpenWeatherMap.
export class ApiError extends Error {
  constructor(code) {
    super(code);
    this.name = 'ApiError';
    this.code = code;
  }
}

export function createApi(fetchFn = (...args) => fetch(...args)) {
  async function get(path, params) {
    let res;
    try {
      res = await fetchFn(`${path}?${new URLSearchParams(params)}`);
    } catch {
      throw new ApiError('NETWORK');
    }
    if (res.ok) return res.json();

    // Si la respuesta de error no trae nuestro JSON, no ha contestado nuestro servidor.
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.error ?? 'NETWORK');
  }

  return {
    geocode: (query) => get('/api/geocode', { q: query }),
    current: (lat, lon) => get('/api/current', { lat, lon }),
  };
}
