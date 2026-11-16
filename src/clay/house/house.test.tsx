/**
 * @file house.test.ts
 * @description Tests for the clay engine's house and close-up pictures. A recording stand-in for the canvas (jsdom has none) keeps every drawing call, style change and path, numbers rounded; so the tests check that the example house, the small scenes, the desk and the yard draw without errors in light and dark, at desktop and phone sizes and at every time of day, and that what they draw stays the same: the recordings' fingerprints match the stored snapshot (rerun with `-u` after an intended change, and look at the pictures with scripts/house-pictures.ts). They also check the style layer, the light pass, close-up mode, marks and the React wrapper.
 */
import { render } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { BASE_COLORS, colorsFor } from './colors';
import { deskScene } from './examples/desk';
import { HOME_STATES, homeScene, type HomeStateName } from './examples/home';
import { TRAY_PIECES, batteryScene, carScene, heatScene, trayScene } from './examples/small';
import { yardScene } from './examples/yard';
import { HousePicture } from './HousePicture';
import { ITEM_KINDS, type Item } from './items';
import type { CanvasMaker } from './light';
import { drawScene, type ClayScene } from './scene';
import { timeOfDay, type TimeOfDay } from './stage';
import { DEFAULT_STYLE, PROTECTED, STYLE_NAMES, makeStyle } from './styles';

const r2 = (v: unknown): unknown => (typeof v === 'number' ? Math.round(v * 100) / 100 : v);

/** A Path2D that remembers how it was built. */
class RecPath {
  ops: string[] = [];
  private rec(name: string, args: unknown[]) {
    this.ops.push(`${name}(${args.map((a) => (a instanceof RecPath ? `[${a.ops.join(';')}]` : r2(a))).join(',')})`);
  }
  moveTo(...a: unknown[]) {
    this.rec('M', a);
  }
  lineTo(...a: unknown[]) {
    this.rec('L', a);
  }
  closePath() {
    this.rec('Z', []);
  }
  arc(...a: unknown[]) {
    this.rec('A', a);
  }
  ellipse(...a: unknown[]) {
    this.rec('E', a);
  }
  addPath(p: RecPath) {
    this.rec('P', [p]);
  }
}

interface Recording {
  calls: string[];
  canvases: number;
}

/** A canvas maker whose contexts record every call into one log. */
function recorder(): { make: CanvasMaker; rec: Recording } {
  const rec: Recording = { calls: [], canvases: 0 };
  const show = (a: unknown): unknown => (a instanceof RecPath ? `[${a.ops.join(';')}]` : typeof a === 'object' && a !== null && 'id' in a ? `#${(a as { id: number }).id}` : r2(a));
  const make: CanvasMaker = (w, h) => {
    const id = (rec.canvases += 1);
    const canvas = { id, width: w, height: h, getContext: () => ctx, toDataURL: () => '' } as unknown as HTMLCanvasElement & { id: number };
    let grads = 0;
    const state: Record<string | symbol, unknown> = {};
    const ctx = new Proxy(state, {
      get: (target, key) => {
        if (key === 'canvas') return canvas;
        if (key in target) return target[key];
        if (key === 'createLinearGradient' || key === 'createRadialGradient') {
          return (...a: unknown[]) => {
            const g = (grads += 1);
            rec.calls.push(`${id}.${String(key)}#${g}(${a.map(show).join(',')})`);
            return { addColorStop: (o: number, c: string) => rec.calls.push(`${id}.stop#${g}(${r2(o)},${c})`) };
          };
        }
        if (key === 'createImageData') return (w2: number, h2: number) => ({ width: w2, height: h2, data: new Uint8ClampedArray(Math.min(w2 * h2 * 4, 64)) });
        return (...a: unknown[]) => {
          rec.calls.push(`${id}.${String(key)}(${a.map(show).join(',')})`);
        };
      },
      set: (target, key, value) => {
        target[key] = value;
        rec.calls.push(`${id}.${String(key)}=${typeof value === 'object' ? 'gradient' : r2(value)}`);
        return true;
      },
    }) as unknown as CanvasRenderingContext2D;
    return canvas;
  };
  return { make, rec };
}

/** FNV-1a over the log: a short fingerprint of everything drawn. */
function fingerprint(calls: readonly string[]): string {
  let h = 0x811c9dc5;
  for (const line of calls)
    for (let i = 0; i < line.length; i++) {
      h ^= line.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
  return h.toString(16).padStart(8, '0');
}

const RealPath2D = globalThis.Path2D;
beforeAll(() => {
  globalThis.Path2D = RecPath as unknown as typeof Path2D;
});
afterAll(() => {
  globalThis.Path2D = RealPath2D;
});

function draw(scene: ClayScene, o: Parameters<typeof drawScene>[1] = {}) {
  const { make, rec } = recorder();
  const pic = drawScene(scene, { ...o, canvas: make });
  return { pic, rec, fills: rec.calls.filter((c) => /\.fill\(/.test(c)).length };
}

const HOME = (state: HomeStateName) => ({ house: homeScene(state, { plot: true, step: [109 / 29.5, 197 / 29.5] }) });

describe('styles', () => {
  it('builds every style, G by default', () => {
    expect(DEFAULT_STYLE).toBe('half');
    for (const name of STYLE_NAMES) expect(makeStyle(name, colorsFor()).name).toBe(name);
  });

  it('remaps colours through the ramp and leaves protected ones and non-hex alone', () => {
    const g = makeStyle('half', colorsFor());
    expect(g.xf(BASE_COLORS.navy)).not.toBe(BASE_COLORS.navy);
    expect(g.xf(BASE_COLORS.navy)).toMatch(/^#[0-9A-F]{6}$/);
    expect(g.xf(BASE_COLORS.navy)).toBe(g.xf(BASE_COLORS.navy.toLowerCase()));
    for (const p of PROTECTED) expect(g.xf(p)).toBe(p);
    expect(g.xf('rgba(1,2,3,.5)')).toBe('rgba(1,2,3,.5)');
    expect(makeStyle('rich', colorsFor()).xf(BASE_COLORS.navy)).toBe(BASE_COLORS.navy);
  });

  it('keeps more of a kept material, and follows the theme coral', () => {
    const g = makeStyle('half', colorsFor());
    const dist = (a: string, b: string) => [1, 3, 5].reduce((s, i) => s + Math.abs(parseInt(a.slice(i, i + 2), 16) - parseInt(b.slice(i, i + 2), 16)), 0);
    expect(dist(g.xf(BASE_COLORS.coral), BASE_COLORS.coral)).toBeLessThan(dist(g.xf(BASE_COLORS.navy), BASE_COLORS.navy));
    const themed = colorsFor({ coral: '#D9604F', coralLight: 'var(--x)', coralDeep: '#B04030' });
    expect(themed.coral).toBe('#D9604F');
    expect(themed.coralLight).toMatch(/^#[0-9A-F]{6}$/);
  });
});

describe('time of day', () => {
  it('follows the hour', () => {
    expect([3, 6, 7.9, 8, 12, 16.9, 17, 20.4, 20.5, 23].map(timeOfDay)).toEqual(['night', 'dusk', 'dusk', 'day', 'day', 'day', 'dusk', 'dusk', 'night', 'night']);
  });
});

describe('the house', () => {
  const times: TimeOfDay[] = ['day', 'dusk', 'night'];
  const sizes = [
    { w: 1280, h: 720 },
    { w: 360, h: 280 },
  ];

  it.each(Object.keys(HOME_STATES) as HomeStateName[])('draws the %s state at every time, in light and dark, at desktop and phone sizes', (state) => {
    for (const time of times)
      for (const dark of [false, true])
        for (const fit of sizes) {
          const { pic, fills } = draw(HOME(state), { time, dark, fit, dpr: 1 });
          expect(pic.w).toBe(fit.w);
          expect(pic.h).toBe(fit.h);
          expect(fills).toBeGreaterThan(2000);
          for (const [name, [x, y]] of Object.entries(pic.marks)) {
            expect(x, name).toBeGreaterThanOrEqual(0);
            expect(x, name).toBeLessThanOrEqual(fit.w);
            expect(y, name).toBeGreaterThanOrEqual(0);
            expect(y, name).toBeLessThanOrEqual(fit.h);
          }
        }
  });

  it('reports anchors for callouts: rooms, floors, devices, the car', () => {
    const { pic } = draw(HOME('evening'), { time: 'night', s: 29.5, pad: 8 });
    for (const name of ['room:living', 'room:kitchen', 'room:office', 'floor:ground', 'floor:second', 'tv', 'sofa', 'vent', 'battery', 'tank', 'closetPerson', 'kid', 'heatPump', 'frontDoor', 'car']) expect(pic.marks[name], name).toBeDefined();
    expect(pic.w).toBe(682);
    expect(pic.h).toBe(762);
  });

  it('draws one room alone and a selected room with handles over a grid', () => {
    const one = draw({ house: homeScene('cooking', { show: ['ground'], only: 'kitchen' }) }, { time: 'dusk', s: 40 });
    expect(one.pic.marks['room:kitchen']).toBeDefined();
    expect(one.pic.marks['room:living']).toBeUndefined();
    const sel = draw({ house: homeScene('plain', { show: ['ground'], selected: 'kitchen', handles: true, grid: true }) }, { s: 50 });
    expect(sel.pic.marks.selEx).toBeDefined();
    expect(sel.pic.marks.selNx).toBeDefined();
    expect([sel.pic.w, sel.pic.h]).toEqual([805, 563]);
  });

  it('runs the light pass at dusk and night, and in a dark theme by day', () => {
    expect(draw(HOME('plain'), { time: 'day' }).rec.canvases).toBe(2);
    expect(draw(HOME('plain'), { time: 'night' }).rec.canvases).toBe(4);
    expect(draw(HOME('plain'), { time: 'day', dark: true }).rec.canvases).toBe(4);
  });

  it('lights a lamp only while it is on', () => {
    const count = (state: HomeStateName) => draw({ house: homeScene(state, { show: ['ground'], only: 'living' }) }, { time: 'night' }).rec.calls.filter((c) => c.includes('createRadialGradient')).length;
    expect(count('evening')).toBeGreaterThan(count('plain'));
  });
});

describe('close-ups', () => {
  const scenes: [string, ClayScene][] = [
    ['desk', { closeup: deskScene({ lamp: true }) }],
    ['yard', { closeup: yardScene() }],
    ['car', { closeup: carScene('charging', 'dusk') }],
    ['battery', { closeup: batteryScene([0.49, 0.37]) }],
    ['heat', { closeup: heatScene({ running: true, tank: 0.8, vent: 2 }) }],
    ...TRAY_PIECES.map((p): [string, ClayScene] => [`tray ${p}`, { closeup: trayScene(p) }]),
  ];

  it.each(scenes)('draws the %s in light and dark, by day and at night, at desktop and phone sizes', (_name, scene) => {
    for (const time of ['day', 'night'] as const)
      for (const dark of [false, true])
        for (const fit of [
          { w: 640, h: 480 },
          { w: 320, h: 240 },
        ]) {
          const { pic, fills } = draw(scene, { time, dark, fit, dpr: 1 });
          expect([pic.w, pic.h]).toEqual([fit.w, fit.h]);
          expect(fills).toBeGreaterThan(5);
        }
  });

  it('hangs wall pieces in the air: no shadow on a wall in a close-up', () => {
    const wallShade = (calls: string[]) => calls.filter((c) => c.includes('fillStyle=rgba(70,48,28')).length;
    expect(wallShade(draw({ closeup: deskScene() }).rec.calls)).toBe(0);
    expect(wallShade(draw(HOME('plain')).rec.calls)).toBeGreaterThan(0);
  });

  it('shows the data: more cards and sheets draw more', () => {
    const fills = (due: number, done: number) => draw({ closeup: deskScene({ due, done }) }).fills;
    expect(fills(4, 3)).toBeGreaterThan(fills(1, 0));
  });
});

describe('the examples', () => {
  it('use every item kind but the container and the clock (the yard and the desk draw theirs in code) and the towel rail', () => {
    const used = new Set<string>();
    const walk = (items: readonly Item[] | undefined) =>
      (items ?? []).forEach((it) => {
        used.add(it.kind);
        if ('on' in it && Array.isArray(it.on)) walk(it.on);
      });
    for (const state of Object.keys(HOME_STATES) as HomeStateName[]) {
      const scene = homeScene(state, { plot: true });
      for (const f of scene.floors)
        for (const r of f.rooms) {
          walk(r.walls);
          walk(r.items);
        }
      walk(scene.plot?.behind);
      walk(scene.plot?.front);
    }
    for (const s of [carScene('waiting'), batteryScene([0.5, 0.5]), heatScene({ running: true, tank: 1, vent: 1 }), ...TRAY_PIECES.map(trayScene)]) walk(s.items);
    const missing = ITEM_KINDS.filter((k) => !used.has(k));
    expect(missing.sort()).toEqual(['clock', 'container', 'towels']);
  });
});

describe('deterministic output', () => {
  const fixtures: Record<string, () => ClayScene> = {
    'home evening night': () => HOME('evening'),
    'ground cooking dusk': () => ({ house: homeScene('cooking', { show: ['ground'], plot: true, selected: 'kitchen' }) }),
    'first floor night': () => ({ house: homeScene('night', { show: ['first'] }) }),
    'desk night': () => ({ closeup: deskScene({ lamp: true }) }),
    'yard day': () => ({ closeup: yardScene() }),
    'car waiting': () => ({ closeup: carScene('waiting', 'dusk') }),
  };
  const times: Record<string, TimeOfDay> = { 'home evening night': 'night', 'ground cooking dusk': 'dusk', 'first floor night': 'night', 'desk night': 'night', 'yard day': 'day', 'car waiting': 'dusk' };

  it('draws the same twice', () => {
    const a = draw(fixtures['home evening night'](), { time: 'night', s: 29.5 });
    const b = draw(fixtures['home evening night'](), { time: 'night', s: 29.5 });
    expect(fingerprint(a.rec.calls)).toBe(fingerprint(b.rec.calls));
  });

  it('matches the stored fingerprints in every style', () => {
    const out: Record<string, string> = {};
    for (const [name, make] of Object.entries(fixtures)) {
      const { rec } = draw(make(), { time: times[name], s: 30 });
      out[name] = `${rec.calls.length} calls, ${fingerprint(rec.calls)}`;
    }
    for (const style of STYLE_NAMES) {
      const { rec } = draw(fixtures['ground cooking dusk'](), { time: 'day', s: 30, style });
      out[`ground in ${style}`] = `${rec.calls.length} calls, ${fingerprint(rec.calls)}`;
    }
    expect(out).toMatchSnapshot();
  });
});

describe('HousePicture', () => {
  it('renders a decorative canvas', () => {
    const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const { container } = render(<HousePicture scene={{ closeup: trayScene('Lamp') }} time="night" />);
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(canvas?.getAttribute('aria-hidden')).toBe('true');
    spy.mockRestore();
  });
});
