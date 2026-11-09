import { ApiError } from './api.js';
import { formatPlaceOption } from './format.js';

export function isBlank(query) {
  return !query || !String(query).trim();
}

// Busca las ciudades que coinciden. Quita las repetidas (mismo nombre, región y país).
export async function findPlaces(api, query) {
  const places = await api.geocode(String(query).trim());
  const seen = new Set();
  const unique = places.filter((place) => {
    const label = formatPlaceOption(place);
    if (seen.has(label)) return false;
    seen.add(label);
    return true;
  });
  if (unique.length === 0) throw new ApiError('NOT_FOUND');
  return unique;
}

export async function loadWeather(api, place) {
  const current = await api.current(place.lat, place.lon);
  return { place, current };
}
