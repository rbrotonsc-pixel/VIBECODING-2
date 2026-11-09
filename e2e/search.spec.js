import { expect, test } from '@playwright/test';
import { mockApi } from './fixtures.js';

test('busco Madrid y veo su temperatura', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');

  await page.getByLabel('Ciudad').fill('Madrid');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.locator('#summary')).toHaveText('Madrid, ES · 21 °C');
});

test('veo todos los datos del tiempo actual', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');

  await page.getByLabel('Ciudad').fill('Madrid');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.locator('#summary')).toHaveText('Madrid, ES · 21 °C');
  await expect(page.locator('#details')).toHaveText('sensación 21 °C · humedad 40 % · viento 18 km/h · Despejado');
  await expect(page.locator('#sky-icon')).toHaveText('☀️');
});
