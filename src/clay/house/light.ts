/**
 * @file light.ts
 * @description The light pass and the grain of the house pictures. The light pass multiplies the colour canvas by a light map (the ambient light, then each lamp's pool held inside its room, then the surfaces that give their own light), keeps the picture's own pixels, adds the halos and draws the post layer (sound, steam, air) crisp on top; so a night scene keeps each lamp's real colour instead of greying out. The grain is a fixed noise laid only on the picture, for the chalky clay finish.
 * Ported from hearth-concept/clay2/engine.js (grade, grain).
 * Used by: house.ts, closeup.ts.
 */
import { TAU, type Stage } from './stage';

/** Makes a canvas of a size in device pixels: a DOM canvas by default; a test passes its own. */
export type CanvasMaker = (w: number, h: number) => HTMLCanvasElement;

export const domCanvas: CanvasMaker = (w, h) => {
  const cv = document.createElement('canvas');
  cv.width = Math.max(1, w);
  cv.height = Math.max(1, h);
  return cv;
};

/** Whether a stage needs the light pass: anything but plain white light. */
export const needsLightPass = (st: Stage): boolean => !st.env.ambient.every((v) => v >= 255);

/** Draws the post layer straight onto the colour canvas (day light needs no pass). */
export function postOnly(colour: HTMLCanvasElement, st: Stage): HTMLCanvasElement {
  const o = colour.getContext('2d');
  if (!o) return colour;
  o.save();
  o.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);
  st.post.forEach((fn) => fn(o));
  o.restore();
  return colour;
}

/** The colour canvas times the light map, then halos, then the post layer. The alpha is the colour canvas's. */
export function grade(colour: HTMLCanvasElement, st: Stage, make: CanvasMaker = domCanvas): HTMLCanvasElement {
  const w = colour.width;
  const h = colour.height;
  const d = st.dpr;
  const L = make(w, h);
  const l = L.getContext('2d');
  const out = make(w, h);
  const o = out.getContext('2d');
  if (!l || !o) return colour;
  l.fillStyle = `rgb(${st.env.ambient.join(',')})`;
  l.fillRect(0, 0, w, h);
  l.scale(d, d);
  l.globalCompositeOperation = 'lighter';
  for (const q of st.lights) {
    l.save();
    if (q.clip) l.clip(q.clip);
    l.translate(q.p[0], q.p[1]);
    l.scale(1.18, 0.82);
    const g = l.createRadialGradient(0, 0, 0, 0, 0, q.r);
    const [r, gg, b] = q.col;
    g.addColorStop(0, `rgba(${r},${gg},${b},${q.a})`);
    g.addColorStop(0.45, `rgba(${r},${gg},${b},${q.a * 0.5})`);
    g.addColorStop(1, `rgba(${r},${gg},${b},0)`);
    l.fillStyle = g;
    l.beginPath();
    l.arc(0, 0, q.r, 0, TAU);
    l.fill();
    l.restore();
  }
  for (const e of st.emits) {
    l.fillStyle = e.col;
    l.fill(e.p);
  }
  o.drawImage(colour, 0, 0);
  o.globalCompositeOperation = 'multiply';
  o.drawImage(L, 0, 0);
  o.globalCompositeOperation = 'destination-in';
  o.drawImage(colour, 0, 0);
  // Halos only where there is picture; a little beyond its edge is fine.
  o.globalCompositeOperation = 'lighter';
  o.save();
  o.scale(d, d);
  for (const q of st.halos) {
    const g = o.createRadialGradient(q.p[0], q.p[1], 0, q.p[0], q.p[1], q.r);
    const [r, gg, b] = q.col;
    g.addColorStop(0, `rgba(${r},${gg},${b},${q.a})`);
    g.addColorStop(1, `rgba(${r},${gg},${b},0)`);
    o.fillStyle = g;
    o.beginPath();
    o.arc(q.p[0], q.p[1], q.r, 0, TAU);
    o.fill();
  }
  o.restore();
  o.globalCompositeOperation = 'source-over';
  o.save();
  o.scale(d, d);
  for (const fn of st.post) fn(o);
  o.restore();
  return out;
}

/** A fine grain, only on the picture itself. Grey noise laid source-atop flattens contrast slightly: the chalky look. */
export function grain(canvas: HTMLCanvasElement, amount = 0.035, make: CanvasMaker = domCanvas): void {
  const n = make(canvas.width, canvas.height);
  const x = n.getContext('2d');
  const c = canvas.getContext('2d');
  if (!x || !c) return;
  const img = x.createImageData(n.width, n.height);
  const dt = img.data;
  let seed = 1234567;
  for (let i = 0; i < dt.length; i += 4) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const v = seed >>> 24;
    dt[i] = dt[i + 1] = dt[i + 2] = v;
    dt[i + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalAlpha = amount;
  c.globalCompositeOperation = 'source-atop';
  c.drawImage(n, 0, 0);
  c.restore();
}
