// Llamadas de la página al servidor propio (/api). La página nunca habla directamente con OpenWeatherMap.
export function createApi(fetchFn = (...args) => fetch(...args)) {
  async function get(path, params) {
    const res = await fetchFn(`${path}?${new URLSearchParams(params)}`);
    return res.json();
  }

  return {
    geocode: (query) => get('/api/geocode', { q: query }),
    current: (lat, lon) => get('/api/current', { lat, lon }),
  };
}
