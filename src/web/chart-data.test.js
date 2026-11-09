import { describe, expect, it } from 'vitest';
import { buildChartModel, CHART_SIZE } from './chart-data.js';

const at = (hhmm) => new Date(`2026-11-09T${hhmm}:00`);

describe('buildChartModel', () => {
  it('sin puntos no hay gráfica', () => {
    expect(buildChartModel({ measured: [] })).toBeNull();
  });

  it('un solo punto va en el centro', () => {
    const model = buildChartModel({ measured: [{ time: at('10:00'), temp: 21.4 }] });
    expect(model.measured).toHaveLength(1);
    const { left, right } = model.plot;
    expect(model.measured[0].x).toBe((left + right) / 2);
    expect(model.measured[0].label).toBe('10:00 · 21 °C');
  });

  it('el primer punto va a la izquierda, el último a la derecha y el más caliente más arriba', () => {
    const model = buildChartModel({
      measured: [
        { time: at('10:00'), temp: 21.4 },
        { time: at('10:10'), temp: 22 },
      ],
    });
    const [first, second] = model.measured;
    expect(first.x).toBe(CHART_SIZE.left);
    expect(second.x).toBe(CHART_SIZE.width - CHART_SIZE.right);
    expect(second.y).toBeLessThan(first.y);
  });

  it('deja un grado de margen arriba y abajo', () => {
    const model = buildChartModel({
      measured: [
        { time: at('10:00'), temp: 21.4 },
        { time: at('10:10'), temp: 22 },
      ],
    });
    expect(model.yTicks.map((t) => t.label)).toEqual(['20 °C', '22 °C', '23 °C']);
    expect(model.yTicks[0].y).toBe(model.plot.bottom);
    expect(model.yTicks[2].y).toBe(model.plot.top);
    expect(model.xTicks.map((t) => t.label)).toEqual(['10:00', '10:10']);
  });
});
