import { formatTemp } from './format.js';
import { describeSky } from './sky.js';

const clock = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' });

// Color de la temperatura según el valor que se ve (redondeado): más de 30 °C → 'hot', menos de 20 °C → 'cold'.
export function tempLevel(temp) {
  const shown = Math.round(temp);
  if (shown > 30) return 'hot';
  if (shown < 20) return 'cold';
  return null;
}

// Filas de la tabla de previsión, ya con el texto que se muestra. No toca el DOM.
export function buildForecastRows(forecast) {
  return forecast.map((step) => {
    const sky = describeSky(step);
    return {
      time: clock.format(step.time),
      icon: sky.icon,
      sky: sky.label,
      temp: formatTemp(step.temp),
      tempLevel: tempLevel(step.temp),
      rain: step.pop === null || step.pop === undefined ? '—' : `${Math.round(step.pop * 100)} %`,
    };
  });
}

export function renderForecastTable(tbody, rows) {
  tbody.replaceChildren(
    ...rows.map((row) => {
      const tr = document.createElement('tr');
      const cells = [
        { text: row.time },
        { text: `${row.icon} ${row.sky}` },
        { text: row.temp, className: row.tempLevel ? `temp-${row.tempLevel}` : null },
        { text: row.rain },
      ];
      for (const cell of cells) {
        const td = document.createElement('td');
        td.textContent = cell.text;
        if (cell.className) td.className = cell.className;
        tr.append(td);
      }
      return tr;
    }),
  );
}
