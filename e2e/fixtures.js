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

export async function mockApi(page, { geocode = [MADRID], current = MADRID_NOW } = {}) {
  await page.route('**/api/geocode?*', (route) => route.fulfill({ json: geocode }));
  await page.route('**/api/current?*', (route) => route.fulfill({ json: current }));
}
