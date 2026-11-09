import { describeSky } from './sky.js';

const decimal = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 });
const clock = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' });

export function formatTemp(celsius) {
  return `${Math.round(celsius) || 0} °C`;
}

export function msToKmh(metersPerSecond) {
  return Math.round(metersPerSecond * 3.6);
}

export function formatPlace(place) {
  return `${place.name}, ${place.country}`;
}

// Para la lista de coincidencias: incluye la región si la hay, para distinguir ciudades con el mismo nombre.
export function formatPlaceOption(place) {
  return [place.name, place.state, place.country].filter(Boolean).join(', ');
}

export function formatSummary(place, current) {
  return `${formatPlace(place)} · ${formatTemp(current.temp)}`;
}

export function formatDetails(current) {
  const parts = [
    `sensación ${formatTemp(current.feelsLike)}`,
    `humedad ${current.humidity} %`,
    `viento ${msToKmh(current.windSpeed)} km/h`,
    describeSky(current).label,
  ];
  if (current.rain1h) parts.push(`lluvia ${decimal.format(current.rain1h)} mm/h`);
  return parts.join(' · ');
}

export function formatUpdatedAt(date) {
  return `Última actualización: ${clock.format(date)}`;
}
