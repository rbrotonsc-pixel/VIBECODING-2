// Dibuja en un <svg> el modelo que calcula chart-data.js.
const SVG_NS = 'http://www.w3.org/2000/svg';

function el(name, attrs = {}, text) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  if (text !== undefined) node.textContent = text;
  return node;
}

function series(points, kind) {
  const group = el('g', { class: `series series-${kind}` });
  if (points.length > 1) {
    group.append(el('polyline', { points: points.map((p) => `${p.x},${p.y}`).join(' '), class: 'line' }));
  }
  for (const p of points) {
    const dot = el('circle', { cx: p.x, cy: p.y, r: 4, 'data-kind': kind, class: 'dot' });
    dot.append(el('title', {}, p.label));
    group.append(dot);
  }
  return group;
}

export function renderChart(svg, model) {
  svg.replaceChildren();
  if (!model) return;
  svg.setAttribute('viewBox', `0 0 ${model.width} ${model.height}`);

  const axes = el('g', { class: 'axes' });
  for (const tick of model.yTicks) {
    axes.append(el('line', { x1: model.plot.left, x2: model.plot.right, y1: tick.y, y2: tick.y, class: 'grid' }));
    axes.append(el('text', { x: model.plot.left - 6, y: tick.y + 4, 'text-anchor': 'end' }, tick.label));
  }
  for (const tick of model.xTicks) {
    axes.append(el('text', { x: tick.x, y: model.height - 8, 'text-anchor': 'middle' }, tick.label));
  }

  svg.append(axes, series(model.measured, 'measured'));
}
