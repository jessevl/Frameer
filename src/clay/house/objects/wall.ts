/**
 * @file wall.ts
 * @description Pieces on the two back walls of the house pictures (the wall y = 0 on the right, x = 0 on the left): framed pictures, round mirrors, a clock, shelf boards that carry things, bunting, a thermostat, tiles behind a worktop, towels on a rail, an air valve, and windows whose sky follows the time of day, with roller shutters and curtains. In close-up mode (`Stage.bare`) they hang in the air without their shadow on a wall.
 * Ported from hearth-concept/clay2/things-a.js (wall pieces, windows) and things-b.js (backsplash, towelsY, ventY).
 * Used by: items.ts, kitchen.ts, the examples.
 */
import type { Point3 } from '../../clay';
import { dk, lt, type Paint } from '../colors';
import { TAU, hsh, type Stage } from '../stage';
import { air } from './effects';
import type { On } from './furniture';

/** A rectangle on the plane y = at, between x0 and x1. */
export const quadY = (x0: number, x1: number, z0: number, z1: number, at: number): Point3[] => [
  [x0, at, z0],
  [x1, at, z0],
  [x1, at, z1],
  [x0, at, z1],
];
/** A rectangle on the plane x = at, between y0 and y1. */
export const quadX = (y0: number, y1: number, z0: number, z1: number, at: number): Point3[] => [
  [at, y0, z0],
  [at, y1, z0],
  [at, y1, z1],
  [at, y0, z1],
];
/** A circle on the plane y = at. */
export const circY = (xc: number, zc: number, r: number, at = 0.014, n = 22): Point3[] => Array.from({ length: n }, (_, i) => [xc + r * Math.cos((i / n) * TAU), at, zc + r * Math.sin((i / n) * TAU)] as const);
/** A circle on the plane x = at. */
export const circX = (yc: number, zc: number, r: number, at = 0.014, n = 22): Point3[] => Array.from({ length: n }, (_, i) => [at, yc + r * Math.cos((i / n) * TAU), zc + r * Math.sin((i / n) * TAU)] as const);

type Quad = (a0: number, a1: number, z0: number, z1: number, at: number) => Point3[];
type Circ = (ac: number, zc: number, r: number, at?: number) => Point3[];

/** What a framed picture shows. `plain` is a circle on blush (sparse styles show only that). */
export type ArtKind = 'sun' | 'arch' | 'blocks' | 'hills' | 'lines' | 'plain';

function art(st: Stage, Q: Quad, C: Circ, x0: number, x1: number, z0: number, z1: number, kind: ArtKind, at: number): void {
  const K = st.col;
  const w = x1 - x0;
  const h = z1 - z0;
  const q = (a: number, b: number, cc: number, dd: number) => Q(x0 + w * a, x0 + w * b, z0 + h * cc, z0 + h * dd, at + 0.002);
  if (kind === 'sun') {
    st.fill(q(0, 1, 0, 1), K.cream);
    st.fill(C(x0 + w * 0.5, z0 + h * 0.56, Math.min(w, h) * 0.24, at + 0.003), K.coral);
    st.fill(q(0, 1, 0, 0.3), K.sageDeep);
    st.fill(q(0.0, 1, 0.3, 0.36), K.sage);
  } else if (kind === 'arch') {
    st.fill(q(0, 1, 0, 1), K.linen);
    st.fill(q(0.22, 0.78, 0, 0.5), K.terracotta);
    st.fill(C(x0 + w * 0.5, z0 + h * 0.5, w * 0.28, at + 0.003), K.terracotta);
    st.fill(q(0.36, 0.64, 0, 0.36), K.mustard);
  } else if (kind === 'blocks') {
    st.fill(q(0, 1, 0, 1), K.cream);
    st.fill(q(0.1, 0.55, 0.45, 0.9), K.blue);
    st.fill(q(0.4, 0.9, 0.12, 0.6), K.mustard);
    st.fill(C(x0 + w * 0.3, z0 + h * 0.3, Math.min(w, h) * 0.14, at + 0.004), K.coral);
  } else if (kind === 'hills') {
    st.fill(q(0, 1, 0, 1), K.sky);
    st.fill(C(x0 + w * 0.72, z0 + h * 0.7, Math.min(w, h) * 0.12, at + 0.003), K.cream);
    st.fill(q(0, 1, 0, 0.42), K.leaf2);
    st.fill(q(0, 0.6, 0, 0.26), K.leaf);
  } else if (kind === 'lines') {
    st.fill(q(0, 1, 0, 1), K.cream);
    for (let i = 1; i < 6; i++) st.fill(q(0.12, 0.88, i / 6.2 - 0.02, i / 6.2 + 0.03), i % 2 ? K.ink : K.coralLight);
  } else {
    st.fill(q(0, 1, 0, 1), K.blush);
    st.fill(C(x0 + w * 0.5, z0 + h * 0.5, Math.min(w, h) * 0.3, at + 0.003), K.cream);
  }
}

export interface FrameOpts {
  frame?: Paint;
  at?: number;
}

const artIn = (st: Stage, kind: ArtKind): ArtKind => (st.style.sparse === true ? 'plain' : kind);

/** A framed picture on the right wall, from x0 along it, from z0 up. */
export function frameY(st: Stage, x0: number, z0: number, w: number, h: number, kind: ArtKind, o: FrameOpts = {}): void {
  const at = o.at ?? 0.012;
  st.wallShadow(quadY(x0 + 0.02, x0 + w + 0.03, z0 - 0.03, z0 + h - 0.015, at), 0.14);
  st.fill(quadY(x0, x0 + w, z0, z0 + h, at + 0.001), st.paint(o.frame, st.col.oak));
  art(st, quadY, circY, x0 + 0.03, x0 + w - 0.03, z0 + 0.03, z0 + h - 0.03, artIn(st, kind), at + 0.001);
}

/** A framed picture on the left wall, from y0 along it. */
export function frameX(st: Stage, y0: number, z0: number, w: number, h: number, kind: ArtKind, o: FrameOpts = {}): void {
  const at = o.at ?? 0.012;
  st.wallShadow(quadX(y0 - 0.02, y0 + w - 0.02, z0 - 0.03, z0 + h - 0.015, at), 0.14);
  st.fill(quadX(y0, y0 + w, z0, z0 + h, at + 0.001), st.paint(o.frame, st.col.oak));
  art(st, quadX, circX, y0 + 0.03, y0 + w - 0.03, z0 + 0.03, z0 + h - 0.03, artIn(st, kind), at + 0.001);
}

export function mirrorY(st: Stage, xc: number, zc: number, r: number, o: { frame?: Paint } = {}): void {
  st.wallShadow(circY(xc + 0.015, zc - 0.02, r + 0.02), 0.14);
  st.fill(circY(xc, zc, r + 0.025, 0.013), st.paint(o.frame, st.col.ochre));
  const p = st.fill(circY(xc, zc, r, 0.015), st.col.glass);
  st.c.save();
  st.c.clip(p);
  st.line([xc - r * 0.5, 0.016, zc - r * 0.2], [xc + r * 0.1, 0.016, zc + r * 0.8], '#FFFFFF', Math.max(1.5, st.s / 16), 0.55);
  st.line([xc - r * 0.1, 0.016, zc - r * 0.5], [xc + r * 0.4, 0.016, zc + r * 0.5], '#FFFFFF', Math.max(1, st.s / 30), 0.45);
  st.c.restore();
}

export function mirrorX(st: Stage, yc: number, zc: number, r: number, o: { frame?: Paint } = {}): void {
  st.wallShadow(circX(yc - 0.015, zc - 0.02, r + 0.02), 0.14);
  st.fill(circX(yc, zc, r + 0.025, 0.013), st.paint(o.frame, st.col.ochre));
  const p = st.fill(circX(yc, zc, r, 0.015), st.col.glass);
  st.c.save();
  st.c.clip(p);
  st.line([0.016, yc + r * 0.5, zc - r * 0.2], [0.016, yc - r * 0.1, zc + r * 0.8], '#FFFFFF', Math.max(1.5, st.s / 16), 0.55);
  st.c.restore();
}

export function clockY(st: Stage, xc: number, zc: number, r: number): void {
  const C = st.col;
  st.wallShadow(circY(xc + 0.012, zc - 0.015, r), 0.16);
  st.fill(circY(xc, zc, r, 0.013), C.ink);
  st.fill(circY(xc, zc, r * 0.86, 0.015), C.cream);
  st.line([xc, 0.016, zc], [xc + r * 0.45, 0.016, zc + r * 0.3], C.ink, Math.max(1, st.s / 40));
  st.line([xc, 0.016, zc], [xc - r * 0.1, 0.016, zc + r * 0.62], C.coral, Math.max(1, st.s / 40));
}

/** A shelf board on the right wall at height z, with things on it. */
export function shelfY(st: Stage, x0: number, x1: number, z: number, o: { col?: Paint; on?: On } = {}): void {
  st.add(
    (x0 + x1) / 2,
    0.1,
    () => {
      st.wallShadow(quadY(x0 + 0.03, x1 + 0.03, z - 0.14, z - 0.02, 0.012), 0.1);
      st.box(x0, 0.012, z, x1 - x0, 0.2, 0.035, st.paint(o.col, st.col.oak));
      o.on?.(z + 0.035);
    },
    -4,
  );
}

/** A shelf board on the left wall. */
export function shelfX(st: Stage, y0: number, y1: number, z: number, o: { col?: Paint; on?: On } = {}): void {
  st.add(
    0.1,
    (y0 + y1) / 2,
    () => {
      st.box(0.012, y0, z, 0.2, y1 - y0, 0.035, st.paint(o.col, st.col.oak));
      o.on?.(z + 0.035);
    },
    -4,
  );
}

/** Bunting along the left wall; left out of the sparsest styles. */
export function bunting(st: Stage, y0: number, y1: number, z: number): void {
  if (st.style.sparse === true) return;
  const C = st.col;
  const n = 7;
  const cols = [C.coral, C.mustard, C.sage, C.blue];
  st.pline(
    Array.from({ length: n + 1 }, (_, i) => [0.014, y0 + ((y1 - y0) * i) / n, z - Math.sin((i / n) * Math.PI) * 0.1] as const),
    C.graphite,
    Math.max(0.6, st.s / 60),
  );
  for (let i = 0; i < n; i++) {
    const a = y0 + ((y1 - y0) * i) / n;
    const b = y0 + ((y1 - y0) * (i + 1)) / n;
    const za = z - Math.sin((i / n) * Math.PI) * 0.1;
    const zb = z - Math.sin(((i + 1) / n) * Math.PI) * 0.1;
    st.fill([[0.015, a + 0.02, za], [0.015, b - 0.02, zb], [0.015, (a + b) / 2, Math.min(za, zb) - 0.17]], cols[i % 4]);
  }
}

/** A thermostat on the right wall; its mark is coral while it heats. */
export function thermostatY(st: Stage, x: number, z: number, heating = false): void {
  st.fill(quadY(x, x + 0.13, z, z + 0.13, 0.013), st.col.white);
  st.fill(quadY(x + 0.03, x + 0.1, z + 0.045, z + 0.085, 0.015), heating ? st.col.coral : st.col.ink);
}

/** Tiles behind a worktop on the right wall. */
export function backsplash(st: Stage, x0: number, x1: number, z0: number, z1: number, colP?: Paint): void {
  const col = st.paint(colP, st.col.sageLight);
  st.fill(quadY(x0, x1, z0, z1, 0.012), col);
  for (let x = x0 + 0.16; x < x1; x += 0.16) st.line([x, 0.013, z0], [x, 0.013, z1], lt(col, 0.45), st.lw(0.8), 0.9);
  for (let z = z0 + 0.1; z < z1; z += 0.1) st.line([x0, 0.013, z], [x1, 0.013, z], lt(col, 0.45), st.lw(0.8), 0.9);
}

/** A wall of tiles on the right wall, with light joints. */
export function tiledWallY(st: Stage, x0: number, x1: number, z0: number, z1: number, colP?: Paint, joint?: Paint): void {
  st.fill(quadY(x0, x1, z0, z1, 0.012), st.paint(colP, '#C9DCE2'));
  const j = st.paint(joint, '#E6F0F3');
  for (let x = x0; x < x1; x += 0.2) st.line([x, 0.013, z0], [x, 0.013, z1], j, Math.max(0.6, st.s / 60), 0.9);
  for (let z = z0 + 0.13; z < z1; z += 0.14) st.line([x0, 0.013, z], [x1, 0.013, z], j, Math.max(0.6, st.s / 60), 0.9);
}

/** Towels on a rail on the right wall. */
export function towelsY(st: Stage, x0: number, x1: number, z: number, cols?: readonly Paint[]): void {
  const list = (cols ?? ['coralLight', 'white']).map((c) => st.paint(c, st.col.white));
  st.line([x0, 0.05, z], [x1, 0.05, z], st.col.chrome, st.lw(2));
  list.forEach((col, i) => {
    const a = x0 + 0.04 + (i * (x1 - x0)) / list.length;
    const b = a + (x1 - x0) / list.length - 0.08;
    st.fill(quadY(a, b, z - 0.36, z + 0.01, 0.055), col);
    st.line([a, 0.056, z - 0.3], [b, 0.056, z - 0.3], dk(col, 0.1), st.lw(1));
  });
}

/** The air valve on the right wall: when the fan runs harder (level 1, 2), air is drawn in. */
export function ventY(st: Stage, x: number, z: number, level = 0): void {
  st.fill(circY(x, z, 0.1, 0.013), st.col.white);
  st.fill(circY(x, z, 0.06, 0.015), st.col.grey);
  if (level > 0) {
    air(st, x, 0.1, z, 0.9 + 0.25 * level, 1);
    if (level > 1) air(st, x, 0.1, z - 0.02, 1.1, -1);
  }
}

/* ---------- windows ---------- */

export interface WindowOpts {
  frame?: Paint;
  /** How far the roller shutter is up, 1 fully open. */
  open?: number;
  curtain?: Paint;
  panes?: number;
  /** A moon in the night sky. */
  moon?: boolean;
}

function sky(st: Stage): [string, string] {
  if (st.env.night) return ['#1E2A44', '#34436A'];
  if (st.env.dusk) return ['#5B6C97', '#E9B49A'];
  return ['#BFDDEE', '#E7F2F6'];
}

function glass(st: Stage, quad: Quad, at2: (a: number, z: number) => [number, number], a0: number, a1: number, z0: number, z1: number, at: number, o: WindowOpts): void {
  const c = st.c;
  const [top, bot] = sky(st);
  const pts = quad(a0, a1, z0, z1, at);
  const pth = st.path(pts);
  const ps = pts.map((q) => st.P(q[0], q[1], q[2]));
  const g = c.createLinearGradient(0, Math.min(ps[2][1], ps[3][1]), 0, Math.max(ps[0][1], ps[1][1]));
  g.addColorStop(0, top);
  g.addColorStop(1, bot);
  c.fillStyle = g;
  c.fill(pth);
  c.save();
  c.clip(pth);
  if (st.env.night) {
    st.emit(pth, o.moon ? '#C9CCD6' : '#B0B4C0');
    for (let i = 0; i < 7; i++) {
      const t = hsh(i * 3.1 + a0 * 7);
      const u = hsh(i * 5.7 + z0 * 3);
      const q = at2(a0 + (a1 - a0) * t, z0 + (z1 - z0) * (0.35 + 0.6 * u));
      c.beginPath();
      c.arc(q[0], q[1], Math.max(0.6, st.s / 70), 0, TAU);
      c.fillStyle = 'rgba(255,255,255,.85)';
      c.fill();
    }
    if (o.moon) {
      const q = at2(a0 + (a1 - a0) * 0.68, z0 + (z1 - z0) * 0.7);
      c.beginPath();
      c.arc(q[0], q[1], 0.075 * st.s, 0, TAU);
      c.fillStyle = '#FFF7E3';
      c.fill();
      c.beginPath();
      c.arc(q[0] + 0.03 * st.s, q[1] - 0.02 * st.s, 0.065 * st.s, 0, TAU);
      c.fillStyle = top;
      c.fill();
    }
  } else {
    c.globalAlpha = 0.5;
    const q0 = at2(a0 + (a1 - a0) * 0.15, z0);
    const q1 = at2(a0 + (a1 - a0) * 0.5, z1);
    c.beginPath();
    c.moveTo(q0[0], q0[1]);
    c.lineTo(q1[0], q1[1]);
    c.strokeStyle = '#FFFFFF';
    c.lineWidth = Math.max(2, st.s / 9);
    c.stroke();
  }
  c.restore();
}

/** A window on the right wall, between x0 and x1, from z0 to z1. */
export function windowY(st: Stage, x0: number, x1: number, z0: number, z1: number, o: WindowOpts = {}): void {
  const C = st.col;
  const at = 0.012;
  const fr = st.paint(o.frame, C.white);
  const open = o.open ?? 1;
  st.fill(quadY(x0 - 0.06, x1 + 0.06, z0 - 0.06, z1 + 0.06, at), fr);
  glass(st, quadY, (a, z) => st.P(a, at + 0.002, z), x0, x1, z0, z1, at + 0.002, o);
  if (open < 0.98) {
    const zs = z1 - (1 - open) * (z1 - z0);
    st.fill(quadY(x0, x1, zs, z1, at + 0.003), C.grey);
    for (let z = z1 - 0.06; z > zs; z -= 0.07) st.line([x0, at + 0.004, z], [x1, at + 0.004, z], C.greyDeep, Math.max(0.6, st.s / 60), 0.8);
    if (st.env.night) st.emit(st.path(quadY(x0, x1, zs, z1, at + 0.003)), '#000000');
  }
  const n = o.panes ?? 2;
  for (let i = 1; i < n; i++) st.line([x0 + ((x1 - x0) * i) / n, at + 0.004, z0], [x0 + ((x1 - x0) * i) / n, at + 0.004, z1], fr, Math.max(1.2, st.s / 22));
  st.box(x0 - 0.08, at, z0 - 0.1, x1 - x0 + 0.16, 0.1, 0.04, fr, { flat: true });
  if (o.curtain) {
    const cu = st.paint(o.curtain, C.linen);
    for (const [a, b] of [
      [x0 - 0.3, x0 + 0.08],
      [x1 - 0.08, x1 + 0.3],
    ]) {
      st.fill(quadY(a, b, z0 - 0.32, z1 + 0.1, at + 0.02), cu);
      for (let i = 1; i < 5; i++) st.line([a + ((b - a) * i) / 5, at + 0.021, z0 - 0.32], [a + ((b - a) * i) / 5, at + 0.021, z1 + 0.1], i % 2 ? dk(cu, 0.09) : lt(cu, 0.35), Math.max(0.8, st.s / 40), 0.9);
    }
    st.line([x0 - 0.36, at + 0.03, z1 + 0.12], [x1 + 0.36, at + 0.03, z1 + 0.12], C.walnut, Math.max(1.4, st.s / 22));
  }
}

/** A window on the left wall, between y0 and y1. */
export function windowX(st: Stage, y0: number, y1: number, z0: number, z1: number, o: WindowOpts = {}): void {
  const C = st.col;
  const at = 0.012;
  const fr = st.paint(o.frame, C.white);
  const open = o.open ?? 1;
  st.fill(quadX(y0 - 0.06, y1 + 0.06, z0 - 0.06, z1 + 0.06, at), dk(fr, 0.06));
  glass(st, quadX, (a, z) => st.P(at + 0.002, a, z), y0, y1, z0, z1, at + 0.002, o);
  if (open < 0.98) {
    const zs = z1 - (1 - open) * (z1 - z0);
    st.fill(quadX(y0, y1, zs, z1, at + 0.003), dk(C.grey, 0.06));
    for (let z = z1 - 0.06; z > zs; z -= 0.07) st.line([at + 0.004, y0, z], [at + 0.004, y1, z], C.greyDeep, Math.max(0.6, st.s / 60), 0.8);
    if (st.env.night) st.emit(st.path(quadX(y0, y1, zs, z1, at + 0.003)), '#000000');
  }
  const n = o.panes ?? 2;
  for (let i = 1; i < n; i++) st.line([at + 0.004, y0 + ((y1 - y0) * i) / n, z0], [at + 0.004, y0 + ((y1 - y0) * i) / n, z1], dk(fr, 0.06), Math.max(1.2, st.s / 22));
  st.box(at, y0 - 0.08, z0 - 0.1, 0.1, y1 - y0 + 0.16, 0.04, fr, { flat: true });
  if (o.curtain) {
    const cu = st.paint(o.curtain, C.linen);
    for (const [a, b] of [
      [y0 - 0.3, y0 + 0.08],
      [y1 - 0.08, y1 + 0.3],
    ]) {
      st.fill(quadX(a, b, z0 - 0.32, z1 + 0.1, at + 0.02), dk(cu, 0.07));
      for (let i = 1; i < 5; i++) st.line([at + 0.021, a + ((b - a) * i) / 5, z0 - 0.32], [at + 0.021, a + ((b - a) * i) / 5, z1 + 0.1], i % 2 ? dk(cu, 0.15) : lt(cu, 0.25), Math.max(0.8, st.s / 40), 0.9);
    }
    st.line([at + 0.03, y0 - 0.36, z1 + 0.12], [at + 0.03, y1 + 0.36, z1 + 0.12], C.walnut, Math.max(1.4, st.s / 22));
  }
}
