import { createApi } from './api.js';
import { APP_NAME } from './app-name.js';
import { formatDetails, formatPlaceOption, formatSummary } from './format.js';
import { messageFor } from './messages.js';
import { findPlaces, isBlank, loadWeather } from './search.js';
import { describeSky } from './sky.js';

const api = createApi();
const form = document.getElementById('search');
const summary = document.getElementById('summary');
const message = document.getElementById('message');
const icon = document.getElementById('sky-icon');
const details = document.getElementById('details');
const choices = document.getElementById('choices');

document.getElementById('app-name').textContent = APP_NAME;

function showError(error) {
  // Los datos anteriores se quedan como estaban.
  message.textContent = messageFor(error.code);
}

function showChoices(places) {
  choices.replaceChildren(
    ...places.map((place) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = formatPlaceOption(place);
      button.addEventListener('click', () => selectPlace(place));
      const item = document.createElement('li');
      item.append(button);
      return item;
    }),
  );
}

async function selectPlace(place) {
  choices.replaceChildren();
  try {
    const { current } = await loadWeather(api, place);
    summary.textContent = formatSummary(place, current);
    details.textContent = formatDetails(current);
    icon.textContent = describeSky(current).icon;
    message.textContent = '';
  } catch (error) {
    showError(error);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = new FormData(form).get('city');
  if (isBlank(query)) return;

  choices.replaceChildren();
  try {
    const places = await findPlaces(api, query);
    message.textContent = '';
    if (places.length === 1) await selectPlace(places[0]);
    else showChoices(places);
  } catch (error) {
    showError(error);
  }
});
