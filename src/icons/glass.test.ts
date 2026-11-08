/**
 * @file glass.test.ts
 * @description The sheets behind a card: the straight stack and the fan draw exactly what they drew before the layouts became data (Drift's and Lighthouse's committed icons depend on it), and the horizon and cascade layouts sit where each app's mark needs them.
 */
import { describe, expect, it } from 'vitest';
import { behind, flatSheets, rr, SHAPES, sheetRects } from './glass';

const F = SHAPES.std.rect;

/** The pre-layout drawing of one sheet, kept here as the reference. */
const sheet = (p: string, id: string, x: number, y: number, w: number, h: number, r: number, rot: number, op: number) => {
  const t = rot ? ` transform="rotate(${rot} 256 256)"` : '';
  return `<path d="${rr(x, y, w, h, r)}" fill="url(#${p}${id})"${t}/><path d="${rr(x + 1.5, y + 1.5, w - 3, h - 3, r - 1.5)}" fill="none" stroke="#FFFFFF" stroke-opacity="${op}" stroke-width="3"${t}/>`;
};

describe('behind', () => {
  it('draws the straight stack as before', () => {
    expect(behind('a_', F, 'straight', false)).toBe(sheet('a_', 's3', F.x + 56, F.y - 40, F.w - 112, F.h - 24, F.r - 16, 0, 0.5) + sheet('a_', 's2', F.x + 28, F.y - 20, F.w - 56, F.h - 4, F.r - 8, 0, 0.6));
    expect(behind('a_', F, 'straight', true)).toBe(sheet('a_', 's2', F.x + 28, F.y - 28, F.w - 56, F.h, F.r - 8, 0, 0.6));
  });

  it('draws the fan as before', () => {
    expect(behind('a_', F, 'fan', false)).toBe(sheet('a_', 's3', F.x, F.y, F.w, F.h, F.r, -7, 0.5) + sheet('a_', 's2', F.x, F.y, F.w, F.h, F.r, 6, 0.6));
    expect(behind('a_', F, 'fan', true)).toBe(sheet('a_', 's2', F.x, F.y, F.w, F.h, F.r, 8, 0.6));
  });

  it('draws nothing for papers', () => {
    expect(behind('a_', F, 'papers', false)).toBe('');
  });
});

describe('sheetRects', () => {
  it('lays the horizon sheets out to both sides, the back one lower and wider', () => {
    const [back, front] = sheetRects(F, 'horizon', false);
    expect(back.x).toBeLessThan(front.x);
    expect(front.x).toBeLessThan(F.x);
    expect(back.x + back.w).toBeGreaterThan(front.x + front.w);
    expect(back.h).toBeLessThan(front.h);
    expect(front.h).toBeLessThan(F.h);
  });

  it('steps the cascade up and to the right, each sheet smaller', () => {
    const [back, front] = sheetRects(F, 'cascade', false);
    expect(back.y).toBeLessThan(front.y);
    expect(front.y).toBeLessThan(F.y);
    expect(back.x + back.w).toBeGreaterThan(front.x + front.w);
    expect(front.x + front.w).toBeGreaterThan(F.x + F.w);
    expect(back.w).toBeLessThan(front.w);
    expect(front.w).toBeLessThan(F.w);
  });

  it('gives one sheet when small and two otherwise', () => {
    for (const layout of ['straight', 'fan', 'horizon', 'cascade'] as const) {
      expect(sheetRects(F, layout, true)).toHaveLength(1);
      expect(sheetRects(F, layout, false)).toHaveLength(2);
    }
  });
});

describe('flatSheets', () => {
  it('fills the same rectangles in one paint', () => {
    const [q] = sheetRects(F, 'fan', true);
    expect(flatSheets(F, 'fan', true, '#F7B9A9')).toBe(`<path d="${rr(q.x, q.y, q.w, q.h, q.r)}" fill="#F7B9A9" transform="rotate(8 256 256)"/>`);
  });
});
