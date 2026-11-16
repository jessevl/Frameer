/**
 * @file closeup.ts
 * @description Close-up mode: the same engine, objects and style as the house, with no walls, floors or plinth. Things float above a soft shadow (or stand on a slab: a paved drive, a concrete floor), and wall pieces (a window, a shelf, a clock, a board, frames) hang in the air behind them without a shadow on a wall. A close-up is data (an extent, an optional slab, items) and may add its own drawing in code (`draw`), the way an app's scene adds objects only it needs. Small scenes (a car at its charger, a battery, a single piece for a builder's tray) and other apps' pictures (a desk, a container yard) are close-ups.
 * Ported from hearth-concept/clay2/extras.js (small) and scenes.js (bare stages).
 * Used by: scene.ts (renderCloseup), HousePicture, the examples.
 */
import { colorsFor, dk, type Paint } from './colors';
import { placeItems, type Item } from './items';
import { domCanvas, grade, grain, needsLightPass, postOnly } from './light';
import { C30, Stage, envFor, rr, type Pt2 } from './stage';
import { DEFAULT_STYLE, makeStyle } from './styles';
import type { Mark, Picture, PictureOptions } from './house';

/** What a close-up spans in plan, and how high it reaches. */
export interface Extent {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** The highest point. */
  zt: number;
}

/** A slab the things stand on: a rounded rectangle with a top and a side colour, optionally with paving joints and a patch of another surface. */
export interface Slab {
  x: number;
  y: number;
  w: number;
  d: number;
  r?: number;
  /** The slab's bottom and its thickness. */
  z: number;
  h: number;
  top: Paint;
  side?: Paint;
  edge?: number;
  /** Paving joints every `step`, starting at (x0, y0). */
  joints?: { step: number; x0: number; y0: number; col?: Paint };
  /** A patch of the top in another colour (a lawn), clipped to the slab. */
  patch?: { x0: number; y0: number; x1: number; y1: number; col: Paint };
}

export interface CloseupScene {
  extent: Extent;
  slab?: Slab;
  /** How far below 0 the items stand (a slab's top under the origin). */
  ground?: number;
  items?: readonly Item[];
  marks?: readonly Mark[];
  /**
   * An app's own drawing, after the slab and before the items are drawn back to front: it may queue things
   * (`st.add`) and returns the plan outline of the shadow the picture rests on, if any.
   */
  draw?: (st: Stage) => readonly Pt2[] | null | void;
}

/** Draws a close-up. */
export function drawCloseup(scene: CloseupScene, o: PictureOptions = {}): Picture {
  const colors = colorsFor(o.palette);
  const style = makeStyle(o.style ?? DEFAULT_STYLE, colors);
  const time = o.time ?? 'day';
  const env = envFor(time, style, { dark: o.dark, t: o.t });
  const dpr = o.dpr ?? 2;
  const make = o.canvas ?? domCanvas;
  const pad = o.pad ?? 12;
  const e = scene.extent;
  const L = (e.x0 - e.y1) * C30;
  const R = (e.x1 - e.y0) * C30;
  const T = (e.x0 + e.y0) / 2 - e.zt;
  const B = (e.x1 + e.y1) / 2 + 0.5;
  let s = o.s ?? 40;
  if (o.fit) s = Math.max(0.01, Math.min((o.fit.w - pad * 2) / (R - L), (o.fit.h - pad * 2) / (B - T)));
  const wpx = o.fit ? o.fit.w : Math.ceil((R - L) * s + pad * 2);
  const hpx = o.fit ? o.fit.h : Math.ceil((B - T) * s + pad * 2);
  const cv = make(Math.round(wpx * dpr), Math.round(hpx * dpr));
  const c = cv.getContext('2d');
  if (!c) return { canvas: cv, w: wpx, h: hpx, s, marks: {} };
  c.scale(dpr, dpr);
  const spareX = o.fit ? (wpx - (R - L) * s - pad * 2) / 2 : 0;
  const spareY = o.fit ? (hpx - (B - T) * s - pad * 2) / 2 : 0;
  const st = new Stage(c, pad - L * s + spareX, pad - T * s + spareY, s, env, style, colors, dpr);
  st.bare = true;
  let base: readonly Pt2[] | null = null;
  const sl = scene.slab;
  const g = scene.ground ? st.lowered(scene.ground) : st;
  if (sl) {
    const outline = rr(sl.x, sl.y, sl.w, sl.d, sl.r ?? 0.3, 6);
    const top = st.paint(sl.top, colors.paver);
    st.prism(outline, sl.z, sl.h, sl.side ? st.paint(sl.side, top) : dk(top, 0.1), { top, edge: sl.edge ?? 0.3 });
    if (sl.patch) {
      const p = sl.patch;
      const zt = sl.z + sl.h;
      c.save();
      c.clip(st.path(outline.map((q) => [q[0], q[1], zt + 0.001])));
      st.fill([[p.x0, p.y0, zt + 0.002], [p.x1, p.y0, zt + 0.002], [p.x1, p.y1, zt + 0.002], [p.x0, p.y1, zt + 0.002]], st.paint(p.col, colors.lawn));
      c.restore();
    }
    if (sl.joints) {
      const j = sl.joints;
      const col = j.col ? st.paint(j.col, top) : dk(top, 0.08);
      const zj = sl.z + sl.h + (scene.ground ?? 0);
      for (let y = j.y0; y < sl.y + sl.d - 0.3; y += j.step) g.line([sl.x + 0.02, y, zj], [sl.x + sl.w - 0.02, y, zj], col, 0.7, 0.8);
      for (let x = j.x0; x < sl.x + sl.w - 0.3; x += j.step) g.line([x, sl.y + 0.02, zj], [x, sl.y + sl.d - 0.02, zj], col, 0.7, 0.8);
    }
    base = outline;
  }
  const own = scene.draw?.(st);
  if (own) base = own;
  placeItems(g, scene.items ?? []);
  for (const m of scene.marks ?? []) g.mark(m.name, m.x, m.y, m.z ?? 0);
  g.flush();
  st.flush();
  if (env.night) st.light((e.x0 + e.x1) / 2, (e.y0 + e.y1) / 2, 0.3, { r: 6, col: [215, 220, 245], a: 0.6, clip: null });
  const out = needsLightPass(st) ? grade(cv, st, make) : postOnly(cv, st);
  grain(out, 0.03, make);
  if (base) {
    const o2 = out.getContext('2d');
    if (o2) {
      o2.save();
      o2.setTransform(dpr, 0, 0, dpr, 0, 0);
      o2.globalCompositeOperation = 'destination-over';
      o2.filter = `blur(${0.26 * s * dpr}px)`;
      o2.fillStyle = env.night || env.dark ? 'rgba(0,0,0,.5)' : 'rgba(70,48,28,.2)';
      o2.fill(st.path(base.map((p) => [p[0] + 0.25, p[1] + 0.25, -0.34])));
      o2.restore();
    }
  }
  return { canvas: out, w: wpx, h: hpx, s, marks: { ...st.marks } };
}
