// Busca una ciudad y trae su tiempo actual. Usa la primera coincidencia.
export async function searchWeather(api, query) {
  const places = await api.geocode(query);
  const place = places[0];
  const current = await api.current(place.lat, place.lon);
  return { place, current };
}
