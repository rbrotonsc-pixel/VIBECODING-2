import { defineConfig, devices } from '@playwright/test';

// Puerto propio para no chocar con el Vite de Docker (5173).
// API_URL apunta a un puerto cerrado: las pruebas simulan /api y nunca llegan a un servidor real.
const PORT = 5174;

export default defineConfig({
  testDir: 'e2e',
  use: { baseURL: `http://localhost:${PORT}`, timezoneId: 'Europe/Madrid' },
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    env: { API_URL: 'http://localhost:9' },
    reuseExistingServer: false,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
