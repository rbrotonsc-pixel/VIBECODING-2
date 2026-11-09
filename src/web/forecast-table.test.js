import { describe, expect, it } from 'vitest';
import { buildForecastRows } from './forecast-table.js';

describe('buildForecastRows', () => {
  it('calcula hora, cielo, temperatura y probabilidad de lluvia', () => {
    const forecast = [
      { time: new Date('2026-11-09T12:00:00'), temp: 18.4, conditionId: 800, isNight: false, pop: 0.2 },
      { time: new Date('2026-11-09T21:00:00'), temp: 9.6, conditionId: 500, isNight: true, pop: 0.655 },
    ];
    expect(buildForecastRows(forecast)).toEqual([
      { time: '12:00', icon: '☀️', sky: 'Despejado', temp: '18 °C', rain: '20 %' },
      { time: '21:00', icon: '🌧️', sky: 'Lluvia débil', temp: '10 °C', rain: '66 %' },
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
