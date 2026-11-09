// Respuestas simuladas del servidor propio (/api) para las pruebas e2e.
export const MADRID = { name: 'Madrid', country: 'ES', state: 'Comunidad de Madrid', lat: 40.4, lon: -3.7 };

export async function mockApi(page, { geocode = [MADRID], current = { temp: 21.4 } } = {}) {
  await page.route('**/api/geocode?*', (route) => route.fulfill({ json: geocode }));
  await page.route('**/api/current?*', (route) => route.fulfill({ json: current }));
}
