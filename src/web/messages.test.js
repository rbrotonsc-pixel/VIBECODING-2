import { describe, expect, it } from 'vitest';
import { messageFor } from './messages.js';

describe('messageFor', () => {
  it('traduce cada código a un mensaje claro', () => {
    expect(messageFor('NOT_FOUND')).toBe('No se ha encontrado esa ciudad');
    expect(messageFor('INVALID_KEY')).toBe('La clave de OpenWeatherMap no es válida');
    expect(messageFor('NETWORK')).toBe('No se ha podido conectar');
    expect(messageFor('REFRESH_FAILED')).toBe('No se ha podido actualizar. Se reintentará en 10 minutos');
  });

  it('tiene un mensaje genérico para lo demás', () => {
    expect(messageFor('INTERNAL')).toBe('Algo ha fallado. Inténtalo de nuevo');
    expect(messageFor(undefined)).toBe('Algo ha fallado. Inténtalo de nuevo');
  });
});
