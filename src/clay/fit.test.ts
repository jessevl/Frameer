/**
 * @file fit.test.ts
 * @description Fitting a clay drawing by its outline (boxes, cylinders and spheres count, soft shadows do not; nothing drawn gives a unit square), centring it in its box with padding, and fitting a scene by its projected 3D bounds.
 */
import { describe, expect, it } from 'vitest';
import { paletteFrom } from './clayPalette';
import { fitBox, fitTo, outlineOf } from './fit';

const pal = paletteFrom((name) => (name === '--clay-top' ? '0.42' : name.includes('shade') || name.includes('warm') ? '60, 40, 20' : '#A39C92'), false);

describe('outlineOf', () => {
  it('covers a sphere and nothing more', () => {
    const o = outlineOf((K) => K.sphere(0, 0, 0, 1, '#A39C92'), pal);
    expect(o.x0).toBeCloseTo(-1);
    expect(o.x1).toBeCloseTo(1);
    expect(o.y0).toBeCloseTo(-1);
    expect(o.y1).toBeCloseTo(1);
  });

  it('reaches the top of a cylinder and leaves its shadow out', () => {
    const tall = outlineOf((K) => K.cyl(0, 0, 0, 0.5, 2, '#A39C92'), pal);
    expect(tall.y0).toBeLessThan(-2);
    const shadowed = outlineOf((K) => {
      K.shadow(0, 0, 0, 3);
      K.cyl(0, 0, 0, 0.5, 2, '#A39C92');
    }, pal);
    expect(shadowed).toEqual(tall);
  });

  it('gives a unit square when nothing is drawn', () => {
    expect(outlineOf(() => undefined, pal)).toEqual({ x0: -1, y0: -1, x1: 1, y1: 1 });
  });
});

describe('fitTo', () => {
  it('centres the outline and fills the box by its tighter side', () => {
    const { ox, oy, s } = fitTo({ x0: -1, y0: -2, x1: 1, y1: 0 }, 200, 100, 0.1);
    expect(s).toBe(40);
    expect(ox).toBe(100);
    expect(oy).toBe(90);
  });
});

describe('fitBox', () => {
  it('fits the projected bounds inside the box with the padding around them', () => {
    const b = { minX: 0, maxX: 4, minY: 0, maxY: 4, minZ: 0, maxZ: 2 };
    const { ox, oy, s } = fitBox(b, 300, 200, 10);
    const cos30 = Math.cos(Math.PI / 6);
    // Projected extent: x from -4*cos30 to 4*cos30, y from -2 to 4.
    const width = 8 * cos30 * s;
    const height = 6 * s;
    expect(Math.max(width, height)).toBeGreaterThan(0);
    expect(width).toBeLessThanOrEqual(300 - 20 + 1e-6);
    expect(height).toBeLessThanOrEqual(200 - 20 + 1e-6);
    expect(Math.abs(ox - 150)).toBeLessThan(1e-6);
    expect(oy).toBeCloseTo(100 - s);
  });
});
