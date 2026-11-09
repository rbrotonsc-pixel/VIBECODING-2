import { describe, expect, it } from 'vitest';
import { APP_NAME } from './app-name.js';

describe('APP_NAME', () => {
  it('es «Tiempo en directo»', () => {
    expect(APP_NAME).toBe('Tiempo en directo');
  });
});
