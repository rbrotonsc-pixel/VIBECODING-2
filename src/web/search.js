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

// El tiempo actual es imprescindible; la previsión no: si falla, forecast es null.
export async function loadWeather(api, place) {
  const [current, forecast] = await Promise.allSettled([
    api.current(place.lat, place.lon),
    api.forecast(place.lat, place.lon),
  ]);
  if (current.status === 'rejected') throw current.reason;
  return {
    place,
    current: current.value,
    forecast:
      forecast.status === 'fulfilled' ? forecast.value.map((p) => ({ time: new Date(p.time), temp: p.temp })) : null,
  };
}
