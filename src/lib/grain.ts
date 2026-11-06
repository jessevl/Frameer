/**
 * @file grain.ts
 * @description The paper grain's source: the field and the pixels of the tiles (light and dark, each for 1x and for denser screens). The tiles ship as PNGs in `styles/grain/`, made from this by `scripts/gen-grain.ts`, and `grain.test.ts` fails when they no longer match. Imports nothing, so the script runs under plain Node.
 * Based on drift@d91d6950:frontend/src/lib/paper.ts (the Cosy Drift exploration D15 D).
 *
 * Used by: `paper.ts`, `scripts/gen-grain.ts`.
 */

/** The grain tile's side, in device pixels. */
export const GRAIN_SIZE = 256;

// How strong the specks are: a base and the swing of the noise, lighter on dark paper. About 1.4 times the exploration's, by the maintainer's call (2026-10-31).
const GRAIN = { base: 0.009, amp: 0.037, darkBase: 0.011, darkAmp: 0.026 };

/** The grain's field: one value per device pixel, about -1 to 1, wrapping at the edges so the tile repeats without seams. */
export function grainField(n = GRAIN_SIZE): Float32Array {
  // mulberry32: consecutive values are independent, so the grain has no rows.
  let seed = 7;
  const rnd = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let q = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    q = (q + Math.imul(q ^ (q >>> 7), 61 | q)) ^ q;
    return ((q ^ (q >>> 14)) >>> 0) / 4294967296;
  };
  // Smooth value noise with `cells` cells across the tile.
  const octave = (cells: number) => {
    const g = Float32Array.from({ length: cells * cells }, rnd);
    const size = n / cells;
    const smooth = (x: number) => x * x * (3 - 2 * x);
    const at = (i: number, j: number) => g[(j % cells) * cells + (i % cells)] ?? 0;
    return (x: number, y: number) => {
      const gx = x / size;
      const gy = y / size;
      const x0 = Math.floor(gx);
      const y0 = Math.floor(gy);
      const fx = smooth(gx - x0);
      const fy = smooth(gy - y0);
      const a = at(x0, y0);
      const b = at(x0 + 1, y0);
      const c = at(x0, y0 + 1);
      const d = at(x0 + 1, y0 + 1);
      return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
    };
  };
  const big = octave(8);
  const mid = octave(64);
  const white = Float32Array.from({ length: n * n }, rnd);
  const w = (i: number, j: number) => white[((j + n) % n) * n + ((i + n) % n)] ?? 0;
  const field = new Float32Array(n * n);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const soft = (w(x, y) * 4 + w(x - 1, y) + w(x + 1, y) + w(x, y - 1) + w(x, y + 1)) / 8;
      field[y * n + x] = 0.86 * (soft - 0.5) * 2.4 + 0.1 * (mid(x, y) - 0.5) * 2 + 0.04 * (big(x, y) - 0.5) * 2;
    }
  }
  return field;
}

/** The tile's RGBA pixels (not premultiplied): warm brown specks on light paper, warm white on dark. `low` is for screens under 1.5 device pixels per CSS pixel, where each speck is a whole CSS pixel and is made a little fainter. */
export function grainPixels(field: Float32Array, dark: boolean, low: boolean): Uint8ClampedArray {
  const p = new Uint8ClampedArray(field.length * 4);
  const k = low ? 0.8 : 1;
  for (let i = 0; i < field.length; i++) {
    const f = field[i] ?? 0;
    const d = Math.max(0, Math.min(1, dark ? GRAIN.darkBase + GRAIN.darkAmp * k * f : GRAIN.base + GRAIN.amp * k * f));
    const j = i * 4;
    if (dark) {
      p[j] = 255;
      p[j + 1] = 246;
      p[j + 2] = 232;
      p[j + 3] = d * 255;
    } else {
      p[j] = 70;
      p[j + 1] = 56;
      p[j + 2] = 44;
      p[j + 3] = (d / 0.73) * 255;
    }
  }
  return p;
}
