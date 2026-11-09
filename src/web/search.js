import { ApiError } from './api.js';

export function isBlank(query) {
  return !query || !String(query).trim();
}

// Busca una ciudad y trae su tiempo actual. Usa la primera coincidencia.
export async function searchWeather(api, query) {
  const places = await api.geocode(String(query).trim());
  if (places.length === 0) throw new ApiError('NOT_FOUND');
  const place = places[0];
  const current = await api.current(place.lat, place.lon);
  return { place, current };
}
