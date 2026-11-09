import { test as base } from '@playwright/test';

// Respuestas simuladas del servidor propio (/api) para las pruebas e2e.
export const MADRID = { name: 'Madrid', country: 'ES', state: 'Comunidad de Madrid', lat: 40.4, lon: -3.7 };

export const MADRID_NOW = {
  temp: 21.4,
  feelsLike: 20.6,
  humidity: 40,
  windSpeed: 5,
  conditionId: 800,
  description: 'clear sky',
  isNight: false,
  rain1h: null,
};

export function forecastSteps(count, start = '2026-11-09T12:00:00.000Z') {
  const first = new Date(start).getTime();
  return Array.from({ length: count }, (_, i) => ({
    time: new Date(first + i * 3 * 3600 * 1000).toISOString(),
    temp: 18 + i,
  }));
}

// Por defecto, la previsión responde vacía. Cada prueba puede sobrescribirla con su propia ruta.
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route('**/api/forecast?*', (route) => route.fulfill({ json: [] }));
    await use(page);
  },
});

export { expect } from '@playwright/test';

export async function mockApi(page, { geocode = [MADRID], current = MADRID_NOW } = {}) {
  await page.route('**/api/geocode?*', (route) => route.fulfill({ json: geocode }));
  await page.route('**/api/current?*', (route) => route.fulfill({ json: current }));
}
