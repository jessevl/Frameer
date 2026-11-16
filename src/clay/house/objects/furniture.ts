/**
 * @file furniture.ts
 * @description Furniture for the house pictures: sofas (seen from behind, or with their back to the left or right wall), an armchair, a pouf, a beanbag, round and square tables, chairs, stools, the small things on a table (mug, books, fruit bowl, remote) and rugs, square or round, plain or patterned. Sofas and chairs seat people. Things placed on a surface are drawn by `on`, with the surface's height.
 * Ported from hearth-concept/clay2/things-a.js (seating, tables, rugs).
 * Used by: items.ts, the examples.
 */
import { dk, lt, type Paint } from '../colors';
import { TAU, circ, rr, type Stage } from '../stage';
import { personNow, type Person } from './people';

/** Draws what stands on a surface at height z. */
export type On = (z: number) => void;

/** Someone on a sofa: where along it (0 to 1). */
export interface Seated extends Person {
  t: number;
}

export function cushion(st: Stage, x: number, y: number, z: number, w: number, d: number, h: number, col: string): void {
  st.rbox(x, y, z, w, d, h, Math.min(w, d) * 0.28, col, { soft: 0.45 });
}

export interface SofaOpts {
  col?: Paint;
  people?: readonly Seated[];
  /** A throw over the back (sofa seen from behind). */
  throwCol?: Paint;
  /** Pillows: where along the sofa (0 to 1) and their colour. */
  pillows?: readonly (readonly [number, Paint])[];
}

/** A sofa seen from behind: people on it look away from us, toward the back wall. */
export function sofaBack(st: Stage, x: number, y: number, w: number, d: number, o: SofaOpts = {}): void {
  st.add(x + w / 2, y + d / 2, () => {
    const col = st.paint(o.col, st.col.linen);
    const cu = lt(col, 0.3);
    st.shadowR(x, y, w, d, { h: 0.55 });
    st.rbox(x, y, 0.05, w, d, 0.2, 0.13, col);
    st.rbox(x, y, 0.25, 0.22, d - 0.08, 0.26, 0.1, col);
    const n = Math.max(1, Math.round((w - 0.44) / 0.82));
    const cw = (w - 0.48) / n;
    for (let i = 0; i < n; i++) cushion(st, x + 0.24 + i * cw, y + 0.05, 0.25, cw - 0.03, d - 0.36, 0.11, cu);
    for (const q of o.people ?? []) personNow(st, x + 0.26 + q.t * (w - 0.52), y + d * 0.42, { pose: 'sit', z: 0.36, facing: 'back', ...q });
    st.rbox(x + w - 0.22, y, 0.25, 0.22, d - 0.08, 0.26, 0.1, col);
    st.rbox(x + 0.02, y + d - 0.3, 0.25, w - 0.04, 0.3, 0.52, 0.13, col, { soft: 0.3 });
    if (o.throwCol) {
      const tc = st.paint(o.throwCol, st.col.mustard);
      const xa = x + w * 0.58;
      const xb = x + w * 0.9;
      const yy = y + d + 0.006;
      st.fill([[xa, y + d - 0.3, 0.775], [xb, y + d - 0.3, 0.775], [xb, yy, 0.775], [xa, yy, 0.775]], lt(tc, 0.2));
      st.fill([[xa, yy, 0.775], [xb, yy, 0.775], [xb, yy, 0.36], [xa, yy, 0.36]], tc);
      for (let i = 1; i < 5; i++) st.line([xa, yy, 0.36 + i * 0.083], [xb, yy, 0.36 + i * 0.083], lt(tc, 0.45), Math.max(0.6, st.s / 55), 0.8);
      for (let i = 0; i <= 6; i++) st.line([xa + ((xb - xa) * i) / 6, yy, 0.36], [xa + ((xb - xa) * i) / 6, yy, 0.31], tc, Math.max(0.6, st.s / 60));
    }
  });
}

/** A sofa with its back along the left wall; we see the seat. */
export function sofaW(st: Stage, x: number, y: number, w: number, d: number, o: SofaOpts = {}): void {
  st.add(x + w / 2, y + d / 2, () => {
    const col = st.paint(o.col, st.col.linen);
    const cu = lt(col, 0.3);
    st.shadowR(x, y, w, d, { h: 0.55 });
    st.rbox(x, y, 0.05, w, d, 0.2, 0.13, col);
    st.rbox(x, y + 0.02, 0.25, 0.3, d - 0.04, 0.5, 0.13, col, { soft: 0.3 });
    st.rbox(x + 0.06, y, 0.25, w - 0.14, 0.22, 0.26, 0.1, col);
    const n = Math.max(1, Math.round((d - 0.44) / 0.82));
    const cd = (d - 0.48) / n;
    for (let i = 0; i < n; i++) cushion(st, x + 0.32, y + 0.24 + i * cd, 0.25, w - 0.38, cd - 0.03, 0.11, cu);
    for (let i = 0; i < n; i++) st.rbox(x + 0.26, y + 0.27 + i * cd, 0.36, 0.17, cd - 0.09, 0.3, 0.07, cu, { soft: 0.35 });
    for (const [t, pc] of o.pillows ?? []) st.rbox(x + 0.42, y + 0.26 + t * (d - 0.8), 0.36, 0.13, 0.3, 0.24, 0.06, st.paint(pc, cu), { soft: 0.4 });
    for (const q of o.people ?? []) personNow(st, x + 0.36 + (w - 0.42) * 0.42, y + 0.24 + q.t * (d - 0.48), { pose: 'sit', z: 0.36, ...q });
    st.rbox(x + 0.06, y + d - 0.22, 0.25, w - 0.14, 0.22, 0.26, 0.1, col);
  });
}

/** A sofa with its back along the right back wall (y = 0); we see the seat. */
export function sofaN(st: Stage, x: number, y: number, w: number, d: number, o: SofaOpts = {}): void {
  st.add(x + w / 2, y + d / 2, () => {
    const col = st.paint(o.col, st.col.linen);
    const cu = lt(col, 0.3);
    st.shadowR(x, y, w, d, { h: 0.55 });
    st.rbox(x, y, 0.05, w, d, 0.2, 0.13, col);
    st.rbox(x + 0.02, y, 0.25, w - 0.04, 0.3, 0.5, 0.13, col, { soft: 0.3 });
    st.rbox(x, y + 0.06, 0.25, 0.22, d - 0.14, 0.26, 0.1, col);
    const n = Math.max(1, Math.round((w - 0.44) / 0.82));
    const cw = (w - 0.48) / n;
    for (let i = 0; i < n; i++) cushion(st, x + 0.24 + i * cw, y + 0.32, 0.25, cw - 0.03, d - 0.38, 0.11, cu);
    for (let i = 0; i < n; i++) st.rbox(x + 0.27 + i * cw, y + 0.26, 0.36, cw - 0.09, 0.17, 0.3, 0.07, cu, { soft: 0.35 });
    for (const [t, pc] of o.pillows ?? []) st.rbox(x + 0.26 + t * (w - 0.8), y + 0.42, 0.36, 0.3, 0.13, 0.24, 0.06, st.paint(pc, cu), { soft: 0.4 });
    for (const q of o.people ?? []) personNow(st, x + 0.24 + q.t * (w - 0.48), y + 0.36 + (d - 0.42) * 0.42, { pose: 'sit', z: 0.36, ...q });
    st.rbox(x + w - 0.22, y + 0.06, 0.25, 0.22, d - 0.14, 0.26, 0.1, col);
  });
}

export interface ArmchairOpts {
  col?: Paint;
  pillow?: Paint;
  person?: Person;
  /** 'x' faces along x (its back to the left wall); otherwise it faces along y. */
  face?: 'x' | 'y';
}

export function armchair(st: Stage, x: number, y: number, o: ArmchairOpts = {}): void {
  st.add(x + 0.45, y + 0.45, () => {
    const C = st.col;
    const col = st.paint(o.col, C.sage);
    const cu = lt(col, 0.28);
    st.shadowR(x, y, 0.9, 0.9, { h: 0.5, r: 0.3 });
    for (const [a, b] of [
      [0.1, 0.1],
      [0.8, 0.1],
      [0.1, 0.8],
      [0.8, 0.8],
    ])
      st.cyl(x + a, y + b, 0, 0.025, 0.1, C.walnut);
    const pillow = o.pillow ? st.paint(o.pillow, C.mustard) : null;
    if (o.face === 'x') {
      st.rbox(x, y, 0.1, 0.9, 0.9, 0.18, 0.28, col);
      st.rbox(x, y + 0.03, 0.28, 0.3, 0.84, 0.46, 0.14, col, { soft: 0.3 });
      st.rbox(x + 0.1, y, 0.28, 0.72, 0.2, 0.22, 0.09, col);
      cushion(st, x + 0.3, y + 0.2, 0.28, 0.56, 0.5, 0.1, cu);
      if (pillow) st.rbox(x + 0.3, y + 0.3, 0.38, 0.12, 0.3, 0.22, 0.05, pillow, { soft: 0.4 });
      if (o.person) personNow(st, x + 0.55, y + 0.45, { pose: 'sit', z: 0.38, ...o.person });
      st.rbox(x + 0.1, y + 0.7, 0.28, 0.72, 0.2, 0.22, 0.09, col);
    } else {
      st.rbox(x, y, 0.1, 0.9, 0.9, 0.18, 0.28, col);
      st.rbox(x + 0.03, y, 0.28, 0.84, 0.3, 0.46, 0.14, col, { soft: 0.3 });
      st.rbox(x, y + 0.1, 0.28, 0.2, 0.72, 0.22, 0.09, col);
      cushion(st, x + 0.2, y + 0.3, 0.28, 0.5, 0.56, 0.1, cu);
      if (pillow) st.rbox(x + 0.3, y + 0.3, 0.38, 0.3, 0.12, 0.22, 0.05, pillow, { soft: 0.4 });
      if (o.person) personNow(st, x + 0.45, y + 0.55, { pose: 'sit', z: 0.38, ...o.person });
      st.rbox(x + 0.7, y + 0.1, 0.28, 0.2, 0.72, 0.22, 0.09, col);
    }
  });
}

export function pouf(st: Stage, x: number, y: number, r = 0.26, colP?: Paint): void {
  st.add(x, y, () => {
    const col = st.paint(colP, st.col.mustard);
    st.shadowC(x, y, r, { h: 0.25 });
    st.prism(circ(x, y, r, 18), 0, 0.26, col, { soft: 0.45 });
    st.ring(x, y, 0.262, r * 0.55, dk(col, 0.12), Math.max(0.6, st.s / 55), 0.7);
  });
}

export function beanbag(st: Stage, x: number, y: number, colP?: Paint, k = 1): void {
  st.add(x, y, () => {
    const col = st.paint(colP, st.col.blue);
    st.shadowC(x, y, 0.4 * k, { h: 0.3 });
    st.prism(circ(x, y, 0.42 * k, 18), 0, 0.14 * k, col, { soft: 0.2 });
    st.sph(x, y, 0.2 * k, 0.36 * k, col);
    st.sph(x - 0.1 * k, y - 0.1 * k, 0.34 * k, 0.24 * k, lt(col, 0.08));
  });
}

export interface TableOpts {
  col?: Paint;
  leg?: Paint;
  /** Corner radius (square tables). */
  r?: number;
  on?: On;
  bias?: number;
}

export function roundTable(st: Stage, x: number, y: number, r: number, h: number, o: TableOpts = {}): void {
  st.add(x, y, () => {
    st.shadowC(x, y, r * 0.9, { h, a: 0.2 });
    const col = st.paint(o.col, st.col.oak);
    for (const a of [0.5, 2.6, 4.7]) st.cyl(x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6, 0, 0.022, h - 0.045, st.paint(o.leg, st.col.walnut));
    st.prism(circ(x, y, r, 22), h - 0.045, 0.045, col);
    o.on?.(h);
  });
}

export function table(st: Stage, x: number, y: number, w: number, d: number, h: number, o: TableOpts = {}): void {
  st.add(
    x + w / 2,
    y + d / 2,
    () => {
      const col = st.paint(o.col, st.col.oak);
      st.shadowR(x, y, w, d, { h, a: 0.2, r: o.r ?? 0.14 });
      for (const [a, b] of [
        [0.12, 0.12],
        [w - 0.18, 0.12],
        [0.12, d - 0.18],
        [w - 0.18, d - 0.18],
      ])
        st.box(x + a, y + b, 0, 0.06, 0.06, h - 0.05, st.paint(o.leg, st.col.walnut), { flat: true });
      st.rbox(x, y, h - 0.05, w, d, 0.05, o.r ?? 0.14, col);
      o.on?.(h);
    },
    o.bias ?? 0,
  );
}

/** Which way a chair's back is: N and W behind the seat (toward the back walls), S and E in front. */
export type ChairDir = 'N' | 'S' | 'E' | 'W';

export interface ChairOpts {
  seat?: Paint;
  person?: Person;
  bias?: number;
}

export function chair(st: Stage, x: number, y: number, dir: ChairDir, colP?: Paint, o: ChairOpts = {}): void {
  st.add(
    x + 0.19,
    y + 0.19,
    () => {
      const col = st.paint(colP, st.col.walnut);
      const w = 0.38;
      const lg = dk(col, 0.1);
      for (const [a, b] of [
        [0.04, 0.04],
        [w - 0.07, 0.04],
        [0.04, w - 0.07],
        [w - 0.07, w - 0.07],
      ])
        st.box(x + a, y + b, 0, 0.03, 0.03, 0.22, lg, { flat: true });
      const back = () => {
        if (dir === 'N') st.rbox(x + 0.02, y, 0.3, w - 0.04, 0.05, 0.3, 0.02, col);
        if (dir === 'S') st.rbox(x + 0.02, y + w - 0.05, 0.3, w - 0.04, 0.05, 0.3, 0.02, col);
        if (dir === 'W') st.rbox(x, y + 0.02, 0.3, 0.05, w - 0.04, 0.3, 0.02, col);
        if (dir === 'E') st.rbox(x + w - 0.05, y + 0.02, 0.3, 0.05, w - 0.04, 0.3, 0.02, col);
      };
      if (dir === 'N' || dir === 'W') back();
      st.rbox(x, y, 0.22, w, w, 0.05, 0.09, o.seat ? st.paint(o.seat, col) : lt(col, 0.25), { soft: 0.3 });
      if (o.person) personNow(st, x + w / 2, y + w / 2, { pose: 'sit', z: 0.27, ...o.person });
      if (dir === 'S' || dir === 'E') back();
    },
    o.bias ?? 0,
  );
}

export function stool(st: Stage, x: number, y: number, h = 0.42, colP?: Paint): void {
  st.add(x, y, () => {
    st.shadowC(x, y, 0.15, { h: 0.3, a: 0.16 });
    for (const a of [0.6, 2.7, 4.8]) st.line([x + Math.cos(a) * 0.11, y + Math.sin(a) * 0.11, 0], [x + Math.cos(a) * 0.06, y + Math.sin(a) * 0.06, h], st.col.graphite, Math.max(1, st.s / 36));
    st.prism(circ(x, y, 0.16, 16), h, 0.045, st.paint(colP, st.col.oak), { soft: 0.3 });
  });
}

/* ---------- small things for table tops (drawn now) ---------- */

export function mug(st: Stage, x: number, y: number, z: number, col?: Paint): void {
  st.cyl(x, y, z, 0.042, 0.075, st.paint(col, st.col.coralLight), { topFill: dk(st.col.walnut, 0.35) });
}

/** A stack of books; left out of sparse styles. */
export function books(st: Stage, x: number, y: number, z: number, cols?: readonly Paint[]): void {
  if (st.style.sparse) return;
  const C = st.col;
  const list = cols ?? ['blue', 'mustard', 'coralLight'];
  list.forEach((col, i) => st.box(x + i * 0.012, y + i * 0.01, z + i * 0.035, 0.24 - i * 0.02, 0.17, 0.035, st.paint(col, C.blue), { flat: true }));
}

/** A bowl, with fruit; left out of the sparsest styles. */
export function bowl(st: Stage, x: number, y: number, z: number, fruit = true): void {
  if (st.style.sparse === true) return;
  const C = st.col;
  st.cone(x, y, z, 0.07, 0.15, 0.07, C.cream, { topFill: C.linen });
  if (!fruit) return;
  st.sph(x - 0.045, y + 0.01, z + 0.09, 0.05, C.ochre);
  st.sph(x + 0.045, y - 0.02, z + 0.09, 0.05, C.coral);
  st.sph(x, y + 0.045, z + 0.1, 0.05, C.leaf2);
}

/** A remote; left out of sparse styles. */
export function remote(st: Stage, x: number, y: number, z: number): void {
  if (st.style.sparse) return;
  st.rbox(x, y, z, 0.1, 0.1, 0.02, 0.03, st.col.white);
}

/* ---------- rugs ---------- */

export interface RugOpts {
  col?: Paint;
  /** The border line's colour. */
  line?: Paint;
  r?: number;
  pattern?: 'stripes' | 'diamond' | 'dots' | null;
}

export function rug(st: Stage, x: number, y: number, w: number, d: number, o: RugOpts = {}): void {
  st.add(
    x,
    y,
    () => {
      const c = st.c;
      const col = st.paint(o.col, st.col.blush);
      const ln = o.line ? st.paint(o.line, col) : null;
      const r = o.r ?? 0.12;
      const pts = rr(x, y, w, d, r, 5);
      st.shadow(pts, { h: 0.06, a: 0.14, blur: 0.05 });
      st.prism(pts, 0.004, 0.022, col, { top: col, flat: true });
      c.save();
      c.clip(st.path(pts.map((p) => [p[0], p[1], 0.027])));
      const inner = rr(x + 0.16, y + 0.16, w - 0.32, d - 0.32, r * 0.7, 5).map((p) => [p[0], p[1], 0.027] as const);
      c.strokeStyle = ln ?? lt(col, 0.55);
      c.lineWidth = Math.max(1, st.s / 30);
      c.stroke(st.path(inner));
      const pattern = st.style.plain ? null : o.pattern;
      if (pattern === 'stripes') for (let i = 1; i < 9; i++) st.line([x + 0.3, y + (d * i) / 9, 0.027], [x + w - 0.3, y + (d * i) / 9, 0.027], i % 2 ? (ln ?? lt(col, 0.55)) : dk(col, 0.1), Math.max(1, st.s / 26), 0.85);
      if (pattern === 'diamond')
        for (let i = -6; i < 12; i++) {
          st.line([x + i * 0.5, y, 0.027], [x + i * 0.5 + d, y + d, 0.027], ln ?? lt(col, 0.5), Math.max(0.7, st.s / 50), 0.7);
          st.line([x + i * 0.5 + d, y, 0.027], [x + i * 0.5, y + d, 0.027], ln ?? lt(col, 0.5), Math.max(0.7, st.s / 50), 0.7);
        }
      if (pattern === 'dots') for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) st.disc(x + 0.4 + (i * (w - 0.8)) / 5, y + 0.4 + (j * (d - 0.8)) / 3, 0.027, 0.045, ln ?? lt(col, 0.55));
      c.restore();
    },
    -40,
  );
}

export function roundRug(st: Stage, x: number, y: number, r: number, o: RugOpts & { star?: boolean } = {}): void {
  st.add(
    x - r,
    y - r,
    () => {
      const c = st.c;
      const col = st.paint(o.col, st.col.blush);
      const ln = o.line ? st.paint(o.line, col) : lt(col, 0.55);
      const pts = circ(x, y, r, 28);
      st.shadow(pts, { h: 0.06, a: 0.14, blur: 0.05 });
      st.prism(pts, 0.004, 0.022, col, { top: col, flat: true });
      st.ring(x, y, 0.027, r - 0.13, ln, Math.max(1, st.s / 30));
      if (!o.star) return;
      const [a, b] = st.P(x, y, 0.027);
      c.save();
      c.translate(a, b);
      c.scale(1.22, 0.71);
      c.beginPath();
      for (let i = 0; i < 10; i++) {
        const R = (i % 2 ? 0.18 : 0.42) * r * st.s;
        const t = (i / 10) * TAU - 0.4;
        if (i) c.lineTo(Math.cos(t) * R, Math.sin(t) * R);
        else c.moveTo(Math.cos(t) * R, Math.sin(t) * R);
      }
      c.closePath();
      c.fillStyle = ln;
      c.fill();
      c.restore();
    },
    -40,
  );
}
