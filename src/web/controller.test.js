import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from './api.js';
import { createController, REFRESH_MS } from './controller.js';

const MADRID = { name: 'Madrid', country: 'ES', state: null, lat: 40.4, lon: -3.7 };
const BILBAO = { name: 'Bilbao', country: 'ES', state: null, lat: 43.3, lon: -2.9 };
const MINUTE = 60 * 1000;

// API simulada: devuelve, en orden, las temperaturas de la lista (o lanza el error si es un Error).
function fakeApi({ places = [MADRID], temps = [21.4] } = {}) {
  const queue = [...temps];
  const api = {
    calls: [],
    geocode: async () => places,
    current: async (lat, lon) => {
      api.calls.push([lat, lon]);
      const next = queue.length > 1 ? queue.shift() : queue[0];
      if (next instanceof Error) throw next;
      return { temp: next };
    },
  };
  return api;
}

function setup(apiOptions) {
  const api = fakeApi(apiOptions);
  const controller = createController({ api, onChange: () => {}, now: () => new Date() });
  return { api, controller, state: () => controller.getState() };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-09T10:00:00'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('búsqueda', () => {
  it('con una coincidencia carga el tiempo y la hora', async () => {
    const { controller, state } = setup();
    await controller.search('Madrid');
    expect(state()).toMatchObject({ place: MADRID, current: { temp: 21.4 }, error: null, choices: [] });
    expect(state().updatedAt).toEqual(new Date('2026-11-09T10:00:00'));
    controller.stop();
  });

  it('con varias coincidencias las ofrece y carga la elegida', async () => {
    const { api, controller, state } = setup({ places: [MADRID, BILBAO] });
    await controller.search('x');
    expect(state().choices).toEqual([MADRID, BILBAO]);
    expect(api.calls).toEqual([]);

    await controller.select(BILBAO);
    expect(state()).toMatchObject({ place: BILBAO, choices: [] });
    expect(api.calls).toEqual([[43.3, -2.9]]);
    controller.stop();
  });

  it('una búsqueda vacía no hace nada', async () => {
    const api = fakeApi();
    const onChange = vi.fn();
    const controller = createController({ api, onChange });
    await controller.search('   ');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('si la búsqueda falla guarda el error y mantiene la ciudad anterior', async () => {
    const { api, controller, state } = setup();
    await controller.search('Madrid');
    api.geocode = async () => {
      throw new ApiError('NOT_FOUND');
    };
    await controller.search('Ciudadquenoexiste');
    expect(state()).toMatchObject({ place: MADRID, current: { temp: 21.4 }, error: 'NOT_FOUND' });
    controller.stop();
  });
});

describe('refresco automático', () => {
  it('a los 10 minutos pasa de 21 °C a 22 °C y cambia la hora', async () => {
    const { controller, state } = setup({ temps: [21.4, 22.0] });
    await controller.search('Madrid');

    await vi.advanceTimersByTimeAsync(REFRESH_MS - 1);
    expect(state().current.temp).toBe(21.4);

    await vi.advanceTimersByTimeAsync(1);
    expect(state().current.temp).toBe(22.0);
    expect(state().updatedAt).toEqual(new Date('2026-11-09T10:10:00'));
    controller.stop();
  });

  it('si falla mantiene los datos, avisa y vuelve a intentarlo 10 minutos después', async () => {
    const { api, controller, state } = setup({ temps: [21.4, new ApiError('NETWORK'), 23] });
    await controller.search('Madrid');

    await vi.advanceTimersByTimeAsync(REFRESH_MS);
    expect(state()).toMatchObject({ current: { temp: 21.4 }, error: 'REFRESH_FAILED' });
    expect(state().updatedAt).toEqual(new Date('2026-11-09T10:00:00'));

    await vi.advanceTimersByTimeAsync(REFRESH_MS);
    expect(state()).toMatchObject({ current: { temp: 23 }, error: null });
    expect(api.calls).toHaveLength(3);
    controller.stop();
  });

  it('actualizar a mano trae datos nuevos y reinicia la cuenta de 10 minutos', async () => {
    const { api, controller, state } = setup({ temps: [21.4, 22, 23] });
    await controller.search('Madrid');

    await vi.advanceTimersByTimeAsync(5 * MINUTE);
    await controller.refresh();
    expect(state().current.temp).toBe(22);

    await vi.advanceTimersByTimeAsync(9 * MINUTE);
    expect(api.calls).toHaveLength(2);
    await vi.advanceTimersByTimeAsync(1 * MINUTE);
    expect(api.calls).toHaveLength(3);
    expect(state().current.temp).toBe(23);
    controller.stop();
  });

  it('buscar otra ciudad reinicia la cuenta de 10 minutos', async () => {
    const { api, controller } = setup({ places: [MADRID] });
    await controller.search('Madrid');
    await vi.advanceTimersByTimeAsync(5 * MINUTE);
    await controller.select(BILBAO);

    await vi.advanceTimersByTimeAsync(5 * MINUTE);
    expect(api.calls).toHaveLength(2);
    await vi.advanceTimersByTimeAsync(5 * MINUTE);
    expect(api.calls).toHaveLength(3);
    expect(api.calls[2]).toEqual([43.3, -2.9]);
    controller.stop();
  });

  it('sin ciudad, actualizar no hace nada', async () => {
    const { api, controller } = setup();
    await controller.refresh();
    expect(api.calls).toEqual([]);
  });

  it('ignora la respuesta de una ciudad anterior que llega tarde', async () => {
    let releaseMadrid;
    const api = {
      geocode: async () => [MADRID],
      current: (lat) =>
        lat === MADRID.lat
          ? new Promise((resolve) => {
              releaseMadrid = () => resolve({ temp: 10 });
            })
          : Promise.resolve({ temp: 30 }),
    };
    const controller = createController({ api, onChange: () => {} });

    const slow = controller.search('Madrid');
    await vi.advanceTimersByTimeAsync(0);
    await controller.select(BILBAO);
    releaseMadrid();
    await slow;

    expect(controller.getState()).toMatchObject({ place: BILBAO, current: { temp: 30 } });
    controller.stop();
  });
});

describe('histórico para la gráfica', () => {
  it('cada actualización añade un punto', async () => {
    const { controller, state } = setup({ temps: [21.4, 22] });
    await controller.search('Madrid');
    expect(state().history).toEqual([{ time: new Date('2026-11-09T10:00:00'), temp: 21.4 }]);

    await vi.advanceTimersByTimeAsync(REFRESH_MS);
    expect(state().history).toEqual([
      { time: new Date('2026-11-09T10:00:00'), temp: 21.4 },
      { time: new Date('2026-11-09T10:10:00'), temp: 22 },
    ]);
    controller.stop();
  });

  it('una actualización fallida no añade punto', async () => {
    const { controller, state } = setup({ temps: [21.4, new ApiError('NETWORK')] });
    await controller.search('Madrid');
    await vi.advanceTimersByTimeAsync(REFRESH_MS);
    expect(state().history).toHaveLength(1);
    controller.stop();
  });

  it('al cambiar de ciudad empieza de cero', async () => {
    const { controller, state } = setup({ temps: [21.4, 22, 15] });
    await controller.search('Madrid');
    await controller.refresh();
    expect(state().history).toHaveLength(2);

    await controller.select(BILBAO);
    expect(state().history).toEqual([{ time: new Date('2026-11-09T10:00:00'), temp: 15 }]);
    controller.stop();
  });
});
