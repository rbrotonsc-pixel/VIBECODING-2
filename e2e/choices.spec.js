import { expect, test } from '@playwright/test';
import { MADRID_NOW } from './fixtures.js';

const VALENCIA_ES = { name: 'Valencia', country: 'ES', state: null, lat: 39.47, lon: -0.38 };
const VALENCIA_VE = { name: 'Valencia', country: 'VE', state: null, lat: 10.16, lon: -68.0 };

test('busco Valencia, elijo Valencia, VE y se pide su tiempo', async ({ page }) => {
  const currentRequests = [];
  await page.route('**/api/geocode?*', (route) => route.fulfill({ json: [VALENCIA_ES, VALENCIA_VE] }));
  await page.route('**/api/current?*', (route) => {
    currentRequests.push(new URL(route.request().url()).searchParams);
    return route.fulfill({ json: { ...MADRID_NOW, temp: 28 } });
  });
  await page.goto('/');

  await page.getByLabel('Ciudad').fill('Valencia');
  await page.getByRole('button', { name: 'Buscar' }).click();

  const list = page.getByRole('list', { name: 'Coincidencias' });
  await expect(list.getByRole('button')).toHaveText(['Valencia, ES', 'Valencia, VE']);
  expect(currentRequests).toHaveLength(0);

  await list.getByRole('button', { name: 'Valencia, VE' }).click();

  await expect(page.locator('#summary')).toHaveText('Valencia, VE · 28 °C');
  await expect(list).toBeHidden();
  expect(currentRequests).toHaveLength(1);
  expect(currentRequests[0].get('lat')).toBe('10.16');
  expect(currentRequests[0].get('lon')).toBe('-68');
});

test('si solo hay una coincidencia se carga directamente', async ({ page }) => {
  await page.route('**/api/geocode?*', (route) => route.fulfill({ json: [VALENCIA_ES] }));
  await page.route('**/api/current?*', (route) => route.fulfill({ json: MADRID_NOW }));
  await page.goto('/');

  await page.getByLabel('Ciudad').fill('Valencia');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.locator('#summary')).toHaveText('Valencia, ES · 21 °C');
  await expect(page.locator('#choices')).toBeEmpty();
});
