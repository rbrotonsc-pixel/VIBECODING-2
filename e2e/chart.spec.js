import { expect, forecastSteps, MADRID, MADRID_NOW, test } from './fixtures.js';

test('tras 2 actualizaciones la gráfica tiene 2 puntos', async ({ page }) => {
  const temps = [21.4, 22];
  await page.route('**/api/geocode?*', (route) => route.fulfill({ json: [MADRID] }));
  await page.route('**/api/current?*', (route) =>
    route.fulfill({ json: { ...MADRID_NOW, temp: temps.length > 1 ? temps.shift() : temps[0] } }),
  );
  await page.goto('/');
  await expect(page.locator('#chart-card')).toBeHidden();

  await page.getByLabel('Ciudad').fill('Madrid');
  await page.getByRole('button', { name: 'Buscar' }).click();
  const measured = page.locator('#chart circle[data-kind="measured"]');
  await expect(measured).toHaveCount(1);

  await page.getByRole('button', { name: 'Actualizar' }).click();

  await expect(page.locator('#summary')).toHaveText('Madrid, ES · 22 °C');
  await expect(measured).toHaveCount(2);
  await expect(page.getByRole('img', { name: 'Evolución de la temperatura' })).toBeVisible();
});

test('la gráfica muestra los 8 puntos de previsión', async ({ page }) => {
  const forecastRequests = [];
  await page.route('**/api/geocode?*', (route) => route.fulfill({ json: [MADRID] }));
  await page.route('**/api/current?*', (route) => route.fulfill({ json: MADRID_NOW }));
  await page.route('**/api/forecast?*', (route) => {
    forecastRequests.push(new URL(route.request().url()).searchParams);
    return route.fulfill({ json: forecastSteps(8) });
  });
  await page.goto('/');

  await page.getByLabel('Ciudad').fill('Madrid');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.locator('#chart circle[data-kind="forecast"]')).toHaveCount(8);
  await expect(page.locator('#chart circle[data-kind="measured"]')).toHaveCount(1);
  await expect(page.locator('#chart .now-label')).toHaveText('ahora');
  expect(forecastRequests[0].get('lat')).toBe('40.4');
  expect(forecastRequests[0].get('lon')).toBe('-3.7');
});
