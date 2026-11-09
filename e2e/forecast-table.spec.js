import { expect, forecastSteps, MADRID, MADRID_NOW, test } from './fixtures.js';

test('la tabla muestra las 8 franjas de la previsión', async ({ page }) => {
  await page.route('**/api/geocode?*', (route) => route.fulfill({ json: [MADRID] }));
  await page.route('**/api/current?*', (route) => route.fulfill({ json: MADRID_NOW }));
  await page.route('**/api/forecast?*', (route) => route.fulfill({ json: forecastSteps(8) }));
  await page.goto('/');
  await expect(page.locator('#forecast-card')).toBeHidden();

  await page.getByLabel('Ciudad').fill('Madrid');
  await page.getByRole('button', { name: 'Buscar' }).click();

  const table = page.getByRole('table', { name: 'Próximas 24 horas' });
  const rows = table.locator('tbody tr');
  await expect(rows).toHaveCount(8);
  await expect(rows.first().locator('td')).toHaveText(['12:00', '☀️ Despejado', '18 °C', '20 %']);
  await expect(rows.last().locator('td').first()).toHaveText('09:00');
});

test('sin previsión no se muestra la tabla', async ({ page }) => {
  await page.route('**/api/geocode?*', (route) => route.fulfill({ json: [MADRID] }));
  await page.route('**/api/current?*', (route) => route.fulfill({ json: MADRID_NOW }));
  await page.goto('/');

  await page.getByLabel('Ciudad').fill('Madrid');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.locator('#summary')).toHaveText('Madrid, ES · 21 °C');
  await expect(page.locator('#forecast-card')).toBeHidden();
});
