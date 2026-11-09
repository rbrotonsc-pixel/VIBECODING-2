import { createApi } from './api.js';
import { APP_NAME } from './app-name.js';
import { formatSummary } from './format.js';
import { searchWeather } from './search.js';

const api = createApi();
const form = document.getElementById('search');
const summary = document.getElementById('summary');

document.getElementById('app-name').textContent = APP_NAME;

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = new FormData(form).get('city');
  const { place, current } = await searchWeather(api, query);
  summary.textContent = formatSummary(place, current);
});
