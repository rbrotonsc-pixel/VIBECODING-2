import { expect, test } from '@playwright/test';
import { MADRID, mockApi } from './fixtures.js';

async function search(page, city) {
  await page.getByLabel('Ciudad').fill(city);
  await page.getByRole('button', { name: 'Buscar' }).click();
}

test('ciudad inexistente: aviso y no cambia nada más', async ({ page }) => {
  await mockApi(page, { geocode: [] });
  await page.goto('/');

  await search(page, 'Ciudadquenoexiste');

  await expect(page.getByRole('alert')).toHaveText('No se ha encontrado esa ciudad');
  await expect(page.locator('#summary')).toHaveText('');
});

test('clave no válida: aviso', async ({ page }) => {
  await page.route('**/api/geocode?*', (route) => route.fulfill({ status: 502, json: { error: 'INVALID_KEY' } }));
  await page.goto('/');

  await search(page, 'Madrid');

  await expect(page.getByRole('alert')).toHaveText('La clave de OpenWeatherMap no es válida');
});

test('fallo de red: aviso', async ({ page }) => {
  await page.route('**/api/geocode?*', (route) => route.abort('internetdisconnected'));
  await page.goto('/');

  await search(page, 'Madrid');

  await expect(page.getByRole('alert')).toHaveText('No se ha podido conectar');
});

test('campo vacío: no se hace ninguna petición', async ({ page }) => {
  let requests = 0;
  await page.route('**/api/**', (route) => {
    requests += 1;
    return route.fulfill({ json: [] });
  });
  await page.goto('/');

  await search(page, '   ');

  await expect(page.locator('#summary')).toHaveText('');
  await expect(page.locator('#message')).toBeEmpty();
  expect(requests).toBe(0);
});

test('si una búsqueda falla, se sigue viendo la ciudad anterior', async ({ page }) => {
  await mockApi(page, { geocode: [MADRID] });
  await page.goto('/');
  await search(page, 'Madrid');
  await expect(page.locator('#summary')).toHaveText('Madrid, ES · 21 °C');

  await page.unroute('**/api/geocode?*');
  await page.route('**/api/geocode?*', (route) => route.fulfill({ json: [] }));
  await search(page, 'Ciudadquenoexiste');

  await expect(page.getByRole('alert')).toHaveText('No se ha encontrado esa ciudad');
  await expect(page.locator('#summary')).toHaveText('Madrid, ES · 21 °C');
});

test('una búsqueda correcta borra el aviso anterior', async ({ page }) => {
  await mockApi(page, { geocode: [] });
  await page.goto('/');
  await search(page, 'Ciudadquenoexiste');
  await expect(page.getByRole('alert')).toHaveText('No se ha encontrado esa ciudad');

  await page.unroute('**/api/geocode?*');
  await page.route('**/api/geocode?*', (route) => route.fulfill({ json: [MADRID] }));
  await search(page, 'Madrid');

  await expect(page.locator('#summary')).toHaveText('Madrid, ES · 21 °C');
  await expect(page.locator('#message')).toBeEmpty();
});
