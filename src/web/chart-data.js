// Calcula dónde va cada punto de la gráfica. No toca el DOM.
export const CHART_SIZE = { width: 640, height: 240, top: 16, right: 16, bottom: 28, left: 44 };

const clock = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' });

export function formatTick(temp) {
  return `${temp} °C`;
}

export function buildChartModel({ measured, forecast = [] }, size = CHART_SIZE) {
  const all = [...measured, ...forecast];
  if (all.length === 0) return null;

  const plot = {
    left: size.left,
    right: size.width - size.right,
    top: size.top,
    bottom: size.height - size.bottom,
  };

  const times = all.map((p) => p.time.getTime());
  const temps = all.map((p) => p.temp);
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const minTemp = Math.floor(Math.min(...temps)) - 1;
  const maxTemp = Math.ceil(Math.max(...temps)) + 1;

  // Con un solo instante, el punto va en el centro.
  const x = (time) =>
    maxTime === minTime
      ? (plot.left + plot.right) / 2
      : plot.left + ((time - minTime) / (maxTime - minTime)) * (plot.right - plot.left);
  const y = (temp) => plot.bottom - ((temp - minTemp) / (maxTemp - minTemp)) * (plot.bottom - plot.top);

  const toPoint = (suffix) => (p) => ({
    x: x(p.time.getTime()),
    y: y(p.temp),
    label: `${clock.format(p.time)} · ${Math.round(p.temp) || 0} °C${suffix}`,
  });

  const midTemp = Math.round((minTemp + maxTemp) / 2);
  const yTicks = [...new Set([minTemp, midTemp, maxTemp])].map((t) => ({ y: y(t), label: formatTick(t) }));

  const xTicks = [...new Set([minTime, maxTime])].map((t) => ({ x: x(t), label: clock.format(new Date(t)) }));

  // Línea vertical «ahora» que separa lo medido de la previsión.
  const lastMeasured = measured.at(-1);
  const nowX = lastMeasured && forecast.length > 0 ? x(lastMeasured.time.getTime()) : null;

  return {
    ...size,
    plot,
    measured: measured.map(toPoint('')),
    forecast: forecast.map(toPoint(' (previsión)')),
    nowX,
    yTicks,
    xTicks,
  };
}
