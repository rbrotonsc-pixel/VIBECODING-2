import { describe, expect, it } from 'vitest';
import {
  formatDetails,
  formatPlace,
  formatPlaceOption,
  formatSummary,
  formatTemp,
  formatUpdatedAt,
  msToKmh,
} from './format.js';

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

describe('msToKmh', () => {
  it('convierte m/s a km/h redondeando', () => {
    expect(msToKmh(5)).toBe(18);
    expect(msToKmh(0)).toBe(0);
    expect(msToKmh(3.3)).toBe(12);
  });
});

describe('formatDetails', () => {
  const madrid = { feelsLike: 20.6, humidity: 40, windSpeed: 5, conditionId: 800, description: 'clear sky', rain1h: null };

  it('muestra sensación, humedad, viento y cielo', () => {
    expect(formatDetails(madrid)).toBe('sensación 21 °C · humedad 40 % · viento 18 km/h · Despejado');
  });

  it('añade la lluvia si la hay, con coma decimal', () => {
    const lluvia = { ...madrid, conditionId: 500, rain1h: 0.42 };
    expect(formatDetails(lluvia)).toBe('sensación 21 °C · humedad 40 % · viento 18 km/h · Lluvia débil · lluvia 0,4 mm/h');
  });
});

describe('formatPlaceOption', () => {
  it('incluye la región si la hay', () => {
    expect(formatPlaceOption({ name: 'Valencia', state: 'Carabobo', country: 'VE' })).toBe('Valencia, Carabobo, VE');
    expect(formatPlaceOption({ name: 'Valencia', state: null, country: 'VE' })).toBe('Valencia, VE');
  });
});

describe('formatUpdatedAt', () => {
  it('muestra la hora con dos cifras', () => {
    expect(formatUpdatedAt(new Date('2026-11-09T09:05:00'))).toBe('Última actualización: 09:05');
  });
});
