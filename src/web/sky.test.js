import { describe, expect, it } from 'vitest';
import { describeSky } from './sky.js';

describe('describeSky', () => {
  it('«clear sky» (800) es Despejado con sol de día y luna de noche', () => {
    expect(describeSky({ conditionId: 800, description: 'clear sky' })).toEqual({ label: 'Despejado', icon: '☀️' });
    expect(describeSky({ conditionId: 800, isNight: true })).toEqual({ label: 'Despejado', icon: '🌙' });
  });

  it('traduce los códigos concretos', () => {
    expect(describeSky({ conditionId: 804 }).label).toBe('Cubierto');
    expect(describeSky({ conditionId: 501 }).label).toBe('Lluvia moderada');
    expect(describeSky({ conditionId: 741 }).label).toBe('Niebla');
  });

  it('usa el grupo para los códigos sin traducción propia', () => {
    expect(describeSky({ conditionId: 211 })).toEqual({ label: 'Tormenta', icon: '⛈️' });
    expect(describeSky({ conditionId: 521 })).toEqual({ label: 'Chubascos', icon: '🌧️' });
    expect(describeSky({ conditionId: 615 })).toEqual({ label: 'Aguanieve', icon: '🌨️' });
  });

  it('si el código es desconocido usa la descripción original', () => {
    expect(describeSky({ conditionId: 999, description: 'weird' })).toEqual({ label: 'weird', icon: '🌡️' });
    expect(describeSky({ conditionId: null })).toEqual({ label: 'Desconocido', icon: '🌡️' });
  });
});
