import { createApi } from './api.js';
import { APP_NAME } from './app-name.js';
import { formatSummary } from './format.js';
import { messageFor } from './messages.js';
import { isBlank, searchWeather } from './search.js';

const api = createApi();
const form = document.getElementById('search');
const summary = document.getElementById('summary');
const message = document.getElementById('message');

document.getElementById('app-name').textContent = APP_NAME;

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = new FormData(form).get('city');
  if (isBlank(query)) return;

  try {
    const { place, current } = await searchWeather(api, query);
    summary.textContent = formatSummary(place, current);
    message.textContent = '';
  } catch (error) {
    // Los datos anteriores se quedan como estaban.
    message.textContent = messageFor(error.code);
  }
});
