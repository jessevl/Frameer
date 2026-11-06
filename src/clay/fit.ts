/**
 * @file fit.ts
 * @description Fits a clay drawing to its box, two ways. `outlineOf` and `fitTo` draw an object once into a context that only records where the shapes go (points, arcs, ellipses), so it can be scaled and centred to fill the box by its own outline instead of a guessed scale; shadows and glows are left out of the outline because they are soft and may spill. `fitBox` does the same for a scene whose 3D bounds are known, by projecting the eight corners isometrically. Both return the origin and scale for `new Clay(ctx, ox, oy, s, pal)`.
 * @app SHARED - Generic: knows nothing about any app's pictures.
 * Ported from drift@frontend/src/items/pictures/fit.ts (outlineOf, fitTo) and yard@frontend/src/pictures/kit/fit.ts (fitBox).
 * Used by: the apps' template objects and scenes, and PictureBox consumers.
 */
import { Clay, type ClayPalette } from "./clay";

/** Screen extent of a drawing at scale 1 with its origin at 0, 0. */
export interface Outline {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

// Measured at a large scale, so the few sizes the drawings keep in pixels (a dot is never under 1.4 px) barely count.
const SCALE = 100;

/** The outline of what `draw` puts on the canvas, in units of the scale. */
export function outlineOf(draw: (K: Clay) => void, pal: ClayPalette): Outline {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  // Shadows draw inside a translate…restore pair; nothing else in the kit moves the canvas.
  let shadow = false;
  const add = (x: number, y: number, rx = 0, ry = rx): void => {
    if (shadow) return;
    x0 = Math.min(x0, x - rx);
    x1 = Math.max(x1, x + rx);
    y0 = Math.min(y0, y - ry);
    y1 = Math.max(y1, y + ry);
  };
  const gradient = { addColorStop: () => undefined };
  const record: Readonly<Record<string, (...a: number[]) => unknown>> = {
    moveTo: (x, y) => add(x, y),
    lineTo: (x, y) => add(x, y),
    bezierCurveTo: (ax, ay, bx, by, x, y) => {
      add(ax, ay);
      add(bx, by);
      add(x, y);
    },
    quadraticCurveTo: (ax, ay, x, y) => {
      add(ax, ay);
      add(x, y);
    },
    arc: (x, y, r) => add(x, y, r),
    ellipse: (x, y, rx, ry) => add(x, y, rx, ry),
    translate: () => {
      shadow = true;
    },
    restore: () => {
      shadow = false;
    },
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
  };
  const state: Record<string | symbol, unknown> = {};
  // A recording stand-in, not a canvas: it answers only what the clay kit calls, so it cannot satisfy the full type.
  const ctx = new Proxy(state, {
    get: (target, key) => (key in target ? target[key] : typeof key === 'string' && Object.prototype.hasOwnProperty.call(record, key) ? record[key] : () => undefined),
    set: (target, key, value) => {
      target[key] = value;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
  draw(new Clay(ctx, 0, 0, SCALE, pal));
  if (!Number.isFinite(x0)) return { x0: -1, y0: -1, x1: 1, y1: 1 };
  return { x0: x0 / SCALE, y0: y0 / SCALE, x1: x1 / SCALE, y1: y1 / SCALE };
}

/** The origin and scale that centre an outline in w x h, leaving `pad` (a share of each side) around it. */
export function fitTo(outline: Outline, w: number, h: number, pad: number): { ox: number; oy: number; s: number } {
  const ow = Math.max(outline.x1 - outline.x0, 1e-3);
  const oh = Math.max(outline.y1 - outline.y0, 1e-3);
  const s = Math.max(0, Math.min((w * (1 - 2 * pad)) / ow, (h * (1 - 2 * pad)) / oh));
  return { ox: w / 2 - ((outline.x0 + outline.x1) / 2) * s, oy: h / 2 - ((outline.y0 + outline.y1) / 2) * s, s };
}

/** A scene's extent in its own 3D units. */
export interface Bounds3 {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

const COS30 = Math.cos(Math.PI / 6);

/** The origin and scale that centre the projected `b` in a `w` by `h` box with `pad` pixels around it. */
export function fitBox(b: Bounds3, w: number, h: number, pad = 8): { ox: number; oy: number; s: number } {
  let x0 = Infinity;
  let x1 = -Infinity;
  let y0 = Infinity;
  let y1 = -Infinity;
  for (const x of [b.minX, b.maxX]) {
    for (const y of [b.minY, b.maxY]) {
      for (const z of [b.minZ, b.maxZ]) {
        const px = (x - y) * COS30;
        const py = (x + y) * 0.5 - z;
        x0 = Math.min(x0, px);
        x1 = Math.max(x1, px);
        y0 = Math.min(y0, py);
        y1 = Math.max(y1, py);
      }
    }
  }
  const sw = Math.max(1, w - pad * 2) / Math.max(1e-6, x1 - x0);
  const sh = Math.max(1, h - pad * 2) / Math.max(1e-6, y1 - y0);
  const s = Math.min(sw, sh);
  return { ox: w / 2 - ((x0 + x1) / 2) * s, oy: h / 2 - ((y0 + y1) / 2) * s, s };
}
