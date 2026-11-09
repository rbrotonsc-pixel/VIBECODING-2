import { expect, test, MADRID, MADRID_NOW } from './fixtures.js';

// Devuelve, en orden, las respuestas de la lista; la última se repite.
async function mockSequence(page, responses) {
  const queue = [...responses];
  let count = 0;
  await page.route('**/api/geocode?*', (route) => route.fulfill({ json: [MADRID] }));
  await page.route('**/api/current?*', (route) => {
    count += 1;
    const next = queue.length > 1 ? queue.shift() : queue[0];
    if (next === 'fail') return route.fulfill({ status: 502, json: { error: 'NETWORK' } });
    return route.fulfill({ json: { ...MADRID_NOW, temp: next } });
  });
  return () => count;
}

async function searchMadrid(page) {
  await page.getByLabel('Ciudad').fill('Madrid');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.locator('#summary')).toHaveText('Madrid, ES · 21 °C');
}

test('se actualiza sola a los 10 minutos', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-09T10:00:00') });
  await mockSequence(page, [21.4, 22]);
  await page.goto('/');
  await searchMadrid(page);
  await expect(page.locator('#updated-at')).toHaveText('Última actualización: 10:00');

  await page.clock.fastForward('10:00');

  await expect(page.locator('#summary')).toHaveText('Madrid, ES · 22 °C');
  await expect(page.locator('#updated-at')).toHaveText('Última actualización: 10:10');
});

test('el botón Actualizar trae datos nuevos', async ({ page }) => {
  await mockSequence(page, [21.4, 23]);
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Actualizar' })).toBeHidden();
  await searchMadrid(page);

  await page.getByRole('button', { name: 'Actualizar' }).click();

  await expect(page.locator('#summary')).toHaveText('Madrid, ES · 23 °C');
});

test('si la actualización falla, se mantienen los datos y se avisa', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-09T10:00:00') });
  await mockSequence(page, [21.4, 'fail']);
  await page.goto('/');
  await searchMadrid(page);

  await page.clock.fastForward('10:00');

  await expect(page.getByRole('alert')).toHaveText('No se ha podido actualizar. Se reintentará en 10 minutos');
  await expect(page.locator('#summary')).toHaveText('Madrid, ES · 21 °C');
  await expect(page.locator('#updated-at')).toHaveText('Última actualización: 10:00');
});
