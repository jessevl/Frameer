/**
 * @file light.ts
 * @description Lamps for the house pictures: a floor lamp, a table lamp, a pendant (globe or dome), a wall light that washes up and down, a glowing cube, a candle, and a bare pool of light for spots hidden in a ceiling. A lit lamp lights its room through the light pass (a pool of its colour, a wider wash, a halo), and its shade takes on its colour.
 * Ported from hearth-concept/clay2/things-a.js (lamps).
 * Used by: items.ts, the other objects, the examples.
 */
import { mix } from '../../../icons/palette';
import { WARM, hexOf, lt, type Paint, type RGB } from '../colors';
import type { Stage } from '../stage';

/** What a lit lamp does to the room: a pool of its colour and a small halo. */
export function glow(st: Stage, x: number, y: number, z: number, lvl: number, col: RGB = WARM, r = 2.6): void {
  if (!lvl) return;
  const sc = col.map((v) => Math.round(v + (255 - v) * 0.3)) as unknown as RGB;
  const hk = st.env.night ? 1 : 0.45;
  st.light(x, y, Math.min(z, 0.5), { r: r * (0.6 + 0.5 * lvl), col: sc, a: Math.min(1, 0.1 + 0.95 * lvl) });
  st.light(x, y, 0.3, { r: 7.5, col: sc, a: 0.34 * Math.pow(lvl, 0.8) });
  st.halo(x, y, z, 0.24 + 0.2 * lvl, col, (0.08 + 0.4 * lvl) * hk);
}

/** The light map's value for a lit shade: grey, brighter as the lamp is. */
export const emitGrey = (lvl: number): string => {
  const v = Math.round(255 * Math.min(1, 0.5 + 0.6 * lvl));
  return `rgb(${v},${v},${v})`;
};

/** A shade's colour: its own when off, tinted toward its light when on. */
export const litShade = (lvl: number, col: RGB, off: string): string => (lvl ? mix(off, hexOf(col, 0.62), Math.min(1, 0.35 + lvl * 2)) : off);

export interface LampOpts {
  shade?: Paint;
  /** How far the lamp's pool reaches. */
  r?: number;
}

export function floorLamp(st: Stage, x: number, y: number, lvl = 0, col: RGB = WARM, o: LampOpts = {}): void {
  const C = st.col;
  st.add(x, y, () => {
    st.shadowC(x, y, 0.15, { h: 0.2, a: 0.18 });
    st.cyl(x, y, 0, 0.13, 0.025, C.graphite);
    st.cyl(x, y, 0.025, 0.016, 0.98, C.graphite);
    const sc = litShade(lvl, col, st.paint(o.shade, C.cream));
    st.cone(x, y, 0.98, 0.21, 0.13, 0.27, sc, { topFill: lvl ? '#FFFFFF' : lt(sc, 0.4) });
    if (lvl) {
      st.emitC(x, y, 1.1, 0.21, emitGrey(lvl));
      glow(st, x, y, 1.1, lvl, col, o.r);
    }
  });
}

export interface TableLampOpts extends LampOpts {
  base?: Paint;
  /** Draw now (on a surface) instead of queueing. */
  now?: boolean;
  bias?: number;
}

export function tableLamp(st: Stage, x: number, y: number, z: number, lvl = 0, col: RGB = WARM, o: TableLampOpts = {}): void {
  const C = st.col;
  const fn = () => {
    const base = st.paint(o.base, C.ochre);
    st.cyl(x, y, z, 0.055, 0.02, base);
    st.cyl(x, y, z + 0.02, 0.014, 0.12, base);
    const sc = litShade(lvl, col, st.paint(o.shade, C.cream));
    st.cone(x, y, z + 0.13, 0.1, 0.065, 0.13, sc, { topFill: lvl ? '#FFFFFF' : lt(sc, 0.4) });
    if (lvl) {
      st.emitC(x, y, z + 0.2, 0.1, emitGrey(lvl));
      glow(st, x, y, z + 0.2, lvl, col, o.r ?? 1.9);
    }
  };
  if (o.now) fn();
  else st.add(x, y, fn, o.bias ?? 0.3);
}

export interface PendantOpts extends LampOpts {
  /** A globe (default) or a dome shade. */
  kind?: 'globe' | 'dome';
  /** The globe's radius. */
  r0?: number;
  /** Where the cord starts (the ceiling); 0.62 above the lamp by default. */
  top?: number;
  bias?: number;
}

/** A globe or dome hanging from the ceiling on a cord. */
export function pendant(st: Stage, x: number, y: number, z: number, lvl = 0, col: RGB = WARM, o: PendantOpts = {}): void {
  const C = st.col;
  st.add(
    x,
    y,
    () => {
      st.line([x, y, z + 0.1], [x, y, o.top ?? z + 0.62], C.graphite, Math.max(0.8, st.s / 45));
      const sc = litShade(lvl, col, st.paint(o.shade, C.cream));
      if (o.kind === 'dome') {
        st.cone(x, y, z, 0.2, 0.05, 0.14, lvl ? hexOf(col, 0.3) : st.paint(o.shade, C.sageDeep));
        if (lvl) {
          st.disc(x, y, z + 0.002, 0.17, mix(C.cream, '#FFF6EA', Math.min(1, lvl * 2)));
          st.emitC(x, y, z, 0.2, emitGrey(lvl));
        }
      } else {
        st.sph(x, y, z + 0.02, o.r0 ?? 0.15, sc);
        if (lvl) st.emitC(x, y, z + 0.02, (o.r0 ?? 0.15) * 1.02, emitGrey(lvl));
      }
      if (lvl) {
        glow(st, x, y, z, lvl, col, o.r ?? 2.3);
        st.light(x, y, 0.3, { r: 1.5, col, a: 0.6 * lvl });
      }
    },
    o.bias ?? 2.5,
  );
}

/** A small box on the left back wall (x = 0) that washes it up and down. */
export function wallLightX(st: Stage, y: number, z: number, lvl = 0, col: RGB = WARM): void {
  st.add(
    0.05,
    y,
    () => {
      st.box(0.012, y - 0.05, z - 0.09, 0.07, 0.1, 0.18, st.col.graphite);
      if (lvl) {
        st.light(0.25, y, z + 0.45, { r: 1.15, col, a: 0.75 * lvl });
        st.light(0.25, y, z - 0.5, { r: 1.15, col, a: 0.75 * lvl });
        st.halo(0.06, y, z + 0.14, 0.26, col, 0.5);
        st.halo(0.06, y, z - 0.14, 0.26, col, 0.5);
      }
    },
    -3,
  );
}

/** A cube that glows (a night light). */
export function lightBox(st: Stage, x: number, y: number, z: number, lvl = 0, col: RGB = WARM): void {
  st.add(x, y, () => {
    st.rbox(x - 0.11, y - 0.11, z, 0.22, 0.22, 0.22, 0.04, lvl ? hexOf(col, 0.45) : st.col.cream, { soft: 0.5 });
    if (lvl) {
      st.emitC(x, y, z + 0.11, 0.17);
      st.light(x, y, 0.15, { r: 0.9 + 2 * lvl, col, a: 0.35 + 1.2 * lvl });
      st.halo(x, y, z + 0.12, 0.2 + 0.6 * lvl, col, 0.3 + 0.6 * lvl);
    }
  });
}

/** A candle; lit when the picture's light says so (an evening with people in). */
export function candle(st: Stage, x: number, y: number, z: number): void {
  st.cyl(x, y, z, 0.03, 0.09, st.col.cream);
  if (!st.env.candles) return;
  const [a, b] = st.P(x, y, z + 0.12);
  const c = st.c;
  c.beginPath();
  c.ellipse(a, b, 0.018 * st.s, 0.035 * st.s, 0, 0, Math.PI * 2);
  c.fillStyle = '#FFD9A0';
  c.fill();
  st.emitC(x, y, z + 0.12, 0.05);
  st.halo(x, y, z + 0.12, 0.22, [255, 200, 130], 0.6);
  st.light(x, y, 0.3, { r: 0.9, col: [255, 190, 120], a: 0.45 });
}
