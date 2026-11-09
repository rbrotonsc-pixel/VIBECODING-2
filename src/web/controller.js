import { findPlaces, isBlank, loadWeather } from './search.js';

export const REFRESH_MS = 10 * 60 * 1000;

// Estado de la app y reglas de búsqueda y refresco, sin tocar el DOM.
// Cada cambio se avisa con onChange(estado).
export function createController({ api, onChange, now = () => new Date(), intervalMs = REFRESH_MS }) {
  let state = { place: null, current: null, updatedAt: null, choices: [], error: null };
  let timer = null;
  let loadId = 0; // para ignorar respuestas de cargas anteriores

  function set(changes) {
    state = { ...state, ...changes };
    onChange(state);
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(refresh, intervalMs);
  }

  async function load(place, { isRefresh }) {
    const id = ++loadId;
    try {
      const { current } = await loadWeather(api, place);
      if (id !== loadId) return;
      set({ place, current, updatedAt: now(), error: null });
    } catch (error) {
      if (id !== loadId) return;
      // Si falla, los datos anteriores se quedan como estaban.
      set({ error: isRefresh ? 'REFRESH_FAILED' : error.code });
    }
    schedule();
  }

  async function search(query) {
    if (isBlank(query)) return;
    set({ choices: [] });
    let places;
    try {
      places = await findPlaces(api, query);
    } catch (error) {
      set({ error: error.code });
      return;
    }
    if (places.length === 1) return select(places[0]);
    set({ choices: places, error: null });
  }

  function select(place) {
    set({ choices: [] });
    return load(place, { isRefresh: false });
  }

  function refresh() {
    if (!state.place) return Promise.resolve();
    return load(state.place, { isRefresh: true });
  }

  function stop() {
    clearTimeout(timer);
  }

  return { search, select, refresh, stop, getState: () => state };
}
