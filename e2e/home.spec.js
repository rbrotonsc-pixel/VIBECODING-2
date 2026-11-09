import { expect, test } from '@playwright/test';

test('la app se abre y muestra su nombre', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Tiempo en directo');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tiempo en directo');
});
