const MESSAGES = {
  NOT_FOUND: 'No se ha encontrado esa ciudad',
  INVALID_KEY: 'La clave de OpenWeatherMap no es válida',
  NETWORK: 'No se ha podido conectar',
};

export function messageFor(code) {
  return MESSAGES[code] ?? 'Algo ha fallado. Inténtalo de nuevo';
}
