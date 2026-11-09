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

test('las temperaturas de más de 30 °C salen en rojo y las de menos de 20 °C en azul', async ({ page }) => {
  const forecast = forecastSteps(3).map((step, i) => ({ ...step, temp: [31, 25, 15][i] }));
  await page.route('**/api/geocode?*', (route) => route.fulfill({ json: [MADRID] }));
  await page.route('**/api/current?*', (route) => route.fulfill({ json: MADRID_NOW }));
  await page.route('**/api/forecast?*', (route) => route.fulfill({ json: forecast }));
  await page.goto('/');

  await page.getByLabel('Ciudad').fill('Madrid');
  await page.getByRole('button', { name: 'Buscar' }).click();

  const temps = page.locator('#forecast-rows td:nth-child(3)');
  await expect(temps).toHaveText(['31 °C', '25 °C', '15 °C']);
  await expect(temps.nth(0)).toHaveClass('temp-hot');
  await expect(temps.nth(0)).toHaveCSS('color', 'rgb(198, 40, 40)');
  await expect(temps.nth(1)).not.toHaveClass(/temp-/);
  await expect(temps.nth(2)).toHaveClass('temp-cold');
  await expect(temps.nth(2)).toHaveCSS('color', 'rgb(21, 101, 192)');
});
