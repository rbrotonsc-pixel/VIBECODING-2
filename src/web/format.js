export function formatTemp(celsius) {
  return `${Math.round(celsius) || 0} °C`;
}

export function formatPlace(place) {
  return `${place.name}, ${place.country}`;
}

export function formatSummary(place, current) {
  return `${formatPlace(place)} · ${formatTemp(current.temp)}`;
}
