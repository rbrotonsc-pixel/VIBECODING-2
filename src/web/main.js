import { createApi } from './api.js';
import { APP_NAME } from './app-name.js';
import { renderChart } from './chart.js';
import { buildChartModel } from './chart-data.js';
import { createController } from './controller.js';
import { formatDetails, formatPlaceOption, formatSummary, formatUpdatedAt } from './format.js';
import { messageFor } from './messages.js';
import { describeSky } from './sky.js';

const $ = (id) => document.getElementById(id);
const form = $('search');

$('app-name').textContent = APP_NAME;

function renderChoices(places) {
  $('choices').replaceChildren(
    ...places.map((place) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = formatPlaceOption(place);
      button.addEventListener('click', () => controller.select(place));
      const item = document.createElement('li');
      item.append(button);
      return item;
    }),
  );
}

function render(state) {
  $('message').textContent = state.error ? messageFor(state.error) : '';
  renderChoices(state.choices);
  if (!state.current) return;
  $('summary').textContent = formatSummary(state.place, state.current);
  $('details').textContent = formatDetails(state.current);
  $('sky-icon').textContent = describeSky(state.current).icon;
  $('updated-at').textContent = formatUpdatedAt(state.updatedAt);
  $('refresh').hidden = false;
  renderChart($('chart'), buildChartModel({ measured: state.history, forecast: state.forecast }));
  $('chart-card').hidden = false;
}

const controller = createController({ api: createApi(), onChange: render });

form.addEventListener('submit', (event) => {
  event.preventDefault();
  controller.search(new FormData(form).get('city'));
});

$('refresh').addEventListener('click', () => controller.refresh());
