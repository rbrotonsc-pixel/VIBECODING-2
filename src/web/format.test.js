import { describe, expect, it } from 'vitest';
import { formatPlace, formatSummary, formatTemp } from './format.js';

describe('formatTemp', () => {
  it('redondea a grados enteros', () => {
    expect(formatTemp(21.4)).toBe('21 °C');
    expect(formatTemp(21.5)).toBe('22 °C');
  });

  it('no muestra «-0 °C»', () => {
    expect(formatTemp(-0.3)).toBe('0 °C');
  });

  it('muestra temperaturas negativas', () => {
    expect(formatTemp(-3.6)).toBe('-4 °C');
  });
});

describe('formatSummary', () => {
  it('une ciudad, país y temperatura', () => {
    const place = { name: 'Madrid', country: 'ES' };
    expect(formatPlace(place)).toBe('Madrid, ES');
    expect(formatSummary(place, { temp: 21.4 })).toBe('Madrid, ES · 21 °C');
  });
});
