import { defineConfig } from 'vitest/config';

// Las pruebas *.db.test.js necesitan el Postgres de Docker: solo se ejecutan con `npm run test:db`.
const dbTests = process.env.DB_TESTS === '1';

export default defineConfig({
  test: {
    include: dbTests ? ['src/**/*.db.test.js'] : ['src/**/*.test.js'],
    exclude: dbTests ? [] : ['src/**/*.db.test.js'],
  },
});
