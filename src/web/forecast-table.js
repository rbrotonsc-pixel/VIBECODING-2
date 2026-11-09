import { formatTemp } from './format.js';
import { describeSky } from './sky.js';

const clock = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' });

// Filas de la tabla de previsión, ya con el texto que se muestra. No toca el DOM.
export function buildForecastRows(forecast) {
  return forecast.map((step) => {
    const sky = describeSky(step);
    return {
      time: clock.format(step.time),
      icon: sky.icon,
      sky: sky.label,
      temp: formatTemp(step.temp),
      rain: step.pop === null || step.pop === undefined ? '—' : `${Math.round(step.pop * 100)} %`,
    };
  });
}

export function renderForecastTable(tbody, rows) {
  tbody.replaceChildren(
    ...rows.map((row) => {
      const tr = document.createElement('tr');
      const cells = [row.time, `${row.icon} ${row.sky}`, row.temp, row.rain];
      for (const text of cells) {
        const td = document.createElement('td');
        td.textContent = text;
        tr.append(td);
      }
      return tr;
    }),
  );
}
