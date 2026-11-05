/**
 * @file paper.ts
 * @description Paper and a breath of light (D15 D): one fine grain on the app's paper surfaces, and a wash from the sun's side far fainter than a light effect. By day the paper warms a little toward the window and settles a little on the far side, more so toward morning and evening; after dark it takes a cool hint. There is no sun spot. The grain is soft wrapping noise in two sizes for the paper's formation and a fine tooth on top, half softened so it reads as fibre rather than static; it is made once at device pixels, and the wash follows the hour. `paper.css` lays both behind the content, so type and pictures stay clean.
 * Based on drift@d91d6950:frontend/src/lib/paper.ts (the Cosy Drift exploration D15 D).
 *
 * Used by: the app shell (`usePaper`).
 */
import { useEffect } from 'react';
import { sunAt } from '@frameer/clay/clay';

/** The grain tile's side, in device pixels. */
export const GRAIN_SIZE = 256;

// How strong the specks are: a base and the swing of the noise, lighter on dark paper. About 1.4 times the exploration's, by the maintainer's call (2026-10-31).
const GRAIN = { base: 0.009, amp: 0.037, darkBase: 0.011, darkAmp: 0.026 };

type Rgba = readonly [number, number, number, number];
const rgba = (c: Rgba) => `rgba(${c.join(',')})`;
const blend = (a: readonly number[], b: readonly number[], k: number) => a.map((v, i) => Math.round(v + ((b[i] ?? v) - v) * k));

/** The wash for an hour, for light and for dark paper: a CSS gradient each. */
export function paperWash(hour: number): { light: string; dark: string } {
  const sun = sunAt(hour);
  const warmth = sun.up ? Math.max(0, Math.min(1, 1 - sun.elev * 1.6)) : 0;
  const wash = (dark: boolean): string => {
    const k = dark ? 0.5 : 1;
    if (!sun.up) {
      const night: Rgba = [92, 104, 150, +(0.026 * k).toFixed(3)];
      return `linear-gradient(${rgba(night)}, ${rgba(night)})`;
    }
    // From the sun's side: the left in the morning, overhead at noon, the right in the evening.
    const deg = 90 + 180 * sun.f;
    const tint = blend([255, 244, 228], [255, 214, 166], warmth);
    const warm: Rgba = [tint[0] ?? 255, tint[1] ?? 244, tint[2] ?? 228, +((0.014 + 0.03 * warmth) * k).toFixed(3)];
    const shade: Rgba = [84, 70, 60, +(dark ? 0 : 0.005 + 0.014 * warmth).toFixed(3)];
    return `linear-gradient(${deg.toFixed(0)}deg, ${rgba(warm)} 0, rgba(${tint.join(',')},0) 62%, ${rgba(shade)} 100%)`;
  };
  return { light: wash(false), dark: wash(true) };
}

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

/** The grain as see-through specks: warm brown on light paper, warm white on dark. A PNG data URL, or null without a canvas. */
function grainTile(field: Float32Array, dark: boolean, dpr: number): string | null {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = GRAIN_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const image = ctx.createImageData(GRAIN_SIZE, GRAIN_SIZE);
  const p = image.data;
  // On a 1x screen each speck is a whole CSS pixel, so it is made a little fainter.
  const low = dpr < 1.5 ? 0.8 : 1;
  for (let i = 0; i < field.length; i++) {
    const f = field[i] ?? 0;
    const d = Math.max(0, Math.min(1, dark ? GRAIN.darkBase + GRAIN.darkAmp * low * f : GRAIN.base + GRAIN.amp * low * f));
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
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL();
}

const hourNow = () => {
  const d = new Date();
  return d.getHours() + d.getMinutes() / 60;
};

/** Puts the grain and the hour's wash on the document as CSS variables (see paper.css), and keeps the wash in step with the hour. */
export function usePaper(): void {
  useEffect(() => {
    const root = document.documentElement.style;
    const setWash = () => {
      const wash = paperWash(hourNow());
      root.setProperty('--paper-wash', wash.light);
      root.setProperty('--paper-wash-dark', wash.dark);
    };
    setWash();
    // The grain takes a few milliseconds to make: it waits until the app is idle.
    const make = () => {
      const dpr = window.devicePixelRatio || 1;
      const field = grainField();
      const light = grainTile(field, false, dpr);
      const dark = grainTile(field, true, dpr);
      if (!light || !dark) return;
      root.setProperty('--paper-grain', `url(${light})`);
      root.setProperty('--paper-grain-dark', `url(${dark})`);
      root.setProperty('--paper-grain-size', `${GRAIN_SIZE / dpr}px`);
    };
    const idle = typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback(make, { timeout: 2000 }) : window.setTimeout(make, 300);
    const timer = window.setInterval(setWash, 60_000);
    return () => {
      window.clearInterval(timer);
      if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, []);
}
