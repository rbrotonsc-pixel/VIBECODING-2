// Estado del cielo en español a partir del código de OpenWeatherMap.
// https://openweathermap.org/weather-conditions
const EXACT = {
  500: 'Lluvia débil',
  501: 'Lluvia moderada',
  502: 'Lluvia intensa',
  503: 'Lluvia muy intensa',
  504: 'Lluvia extrema',
  511: 'Lluvia helada',
  600: 'Nieve débil',
  601: 'Nieve',
  602: 'Nieve intensa',
  701: 'Neblina',
  711: 'Humo',
  721: 'Calima',
  731: 'Polvo',
  741: 'Niebla',
  751: 'Arena',
  761: 'Polvo',
  762: 'Ceniza volcánica',
  771: 'Ráfagas de viento',
  781: 'Tornado',
  800: 'Despejado',
  801: 'Pocas nubes',
  802: 'Nubes dispersas',
  803: 'Nuboso',
  804: 'Cubierto',
};

function group(id) {
  if (id >= 200 && id < 300) return { label: 'Tormenta', icon: '⛈️' };
  if (id >= 300 && id < 400) return { label: 'Llovizna', icon: '🌦️' };
  if (id >= 520 && id < 600) return { label: 'Chubascos', icon: '🌧️' };
  if (id >= 500 && id < 600) return { label: 'Lluvia', icon: '🌧️' };
  if (id >= 611 && id < 620) return { label: 'Aguanieve', icon: '🌨️' };
  if (id >= 620 && id < 700) return { label: 'Chubascos de nieve', icon: '🌨️' };
  if (id >= 600 && id < 700) return { label: 'Nieve', icon: '❄️' };
  if (id >= 700 && id < 800) return { label: 'Niebla', icon: '🌫️' };
  if (id === 800) return { label: 'Despejado', icon: '☀️' };
  if (id === 801) return { label: 'Pocas nubes', icon: '🌤️' };
  if (id === 802) return { label: 'Nubes dispersas', icon: '⛅' };
  if (id === 803 || id === 804) return { label: 'Nuboso', icon: '☁️' };
  return null;
}

export function describeSky({ conditionId, description = '', isNight = false }) {
  const g = group(conditionId);
  if (!g) return { label: description || 'Desconocido', icon: '🌡️' };
  const icon = conditionId === 800 && isNight ? '🌙' : g.icon;
  return { label: EXACT[conditionId] ?? g.label, icon };
}
