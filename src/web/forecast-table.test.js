import { describe, expect, it } from 'vitest';
import { buildForecastRows, tempLevel } from './forecast-table.js';

describe('buildForecastRows', () => {
  it('calcula hora, cielo, temperatura y probabilidad de lluvia', () => {
    const forecast = [
      { time: new Date('2026-11-09T12:00:00'), temp: 18.4, conditionId: 800, isNight: false, pop: 0.2 },
      { time: new Date('2026-11-09T21:00:00'), temp: 9.6, conditionId: 500, isNight: true, pop: 0.655 },
    ];
    expect(buildForecastRows(forecast)).toEqual([
      { time: '12:00', icon: '☀️', sky: 'Despejado', temp: '18 °C', tempLevel: 'cold', rain: '20 %' },
      { time: '21:00', icon: '🌧️', sky: 'Lluvia débil', temp: '10 °C', tempLevel: 'cold', rain: '66 %' },
    ]);
  });

  it('sin probabilidad de lluvia muestra una raya', () => {
    const forecast = [{ time: new Date('2026-11-09T12:00:00'), temp: 18, conditionId: 800, pop: null }];
    expect(buildForecastRows(forecast)[0].rain).toBe('—');
  });

  it('sin previsión no hay filas', () => {
    expect(buildForecastRows([])).toEqual([]);
  });
});

describe('tempLevel', () => {
  it('más de 30 °C (tal como se ve) es caliente', () => {
    expect(tempLevel(30.5)).toBe('hot');
    expect(tempLevel(35)).toBe('hot');
  });

  it('menos de 20 °C (tal como se ve) es frío', () => {
    expect(tempLevel(19.4)).toBe('cold');
    expect(tempLevel(-5)).toBe('cold');
  });

  it('de 20 °C a 30 °C, ambos incluidos, no tiene color', () => {
    expect(tempLevel(30.4)).toBeNull();
    expect(tempLevel(30)).toBeNull();
    expect(tempLevel(25)).toBeNull();
    expect(tempLevel(20)).toBeNull();
    expect(tempLevel(19.5)).toBeNull();
  });
});
