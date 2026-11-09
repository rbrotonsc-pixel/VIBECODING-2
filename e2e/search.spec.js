import { expect, test } from '@playwright/test';
import { mockApi } from './fixtures.js';

test('busco Madrid y veo su temperatura', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');

  await page.getByLabel('Ciudad').fill('Madrid');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.locator('#summary')).toHaveText('Madrid, ES · 21 °C');
});
