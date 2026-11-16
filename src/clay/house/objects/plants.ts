/**
 * @file plants.ts
 * @description Plants for the house pictures: a monstera, a small tree, a snake plant, a cactus, flowers in a vase, a trailing plant and a pot of herbs, each in a pot that tapers to its foot.
 * Ported from hearth-concept/clay2/things-a.js (plants).
 * Used by: items.ts, furniture.ts, kitchen.ts, rooms.ts, the examples.
 */
import { dk, lt, type Paint } from '../colors';
import { TAU, type Stage } from '../stage';

export type PlantKind = 'monstera' | 'tree' | 'snake' | 'cactus' | 'flowers' | 'trail' | 'herb';

export interface PlantOpts {
  /** What it stands on; a plant on the floor (no z) casts a shadow. */
  z?: number;
  /** Size, 1 as drawn. */
  k?: number;
  pot?: Paint;
  vase?: Paint;
  /** Draw now (on a surface) instead of queueing. */
  now?: boolean;
  bias?: number;
}

function leaf(st: Stage, px: number, py: number, len: number, ang: number, wid: number, col: string, vein?: string): void {
  const c = st.c;
  c.save();
  c.translate(px, py);
  c.rotate(ang);
  c.beginPath();
  c.moveTo(0, 0);
  c.quadraticCurveTo(len * 0.45, -wid, len, 0);
  c.quadraticCurveTo(len * 0.45, wid, 0, 0);
  c.fillStyle = col;
  c.fill();
  if (vein) {
    c.beginPath();
    c.moveTo(len * 0.08, 0);
    c.lineTo(len * 0.9, 0);
    c.strokeStyle = vein;
    c.lineWidth = Math.max(0.5, st.s / 60);
    c.stroke();
  }
  c.restore();
}

const pot = (st: Stage, x: number, y: number, z: number, r: number, h: number, col: string) => st.cone(x, y, z, r * 0.78, r, h, col, { topFill: dk(st.col.walnut, 0.25) });

export function plant(st: Stage, x: number, y: number, kind: PlantKind = 'monstera', o: PlantOpts = {}): void {
  const draw = () => drawPlant(st, x, y, kind, o);
  if (o.now) draw();
  else st.add(x, y, draw, o.bias ?? 0);
}

function drawPlant(st: Stage, x: number, y: number, kind: PlantKind, o: PlantOpts): void {
  const C = st.col;
  const c = st.c;
  const s = st.s;
  const z = o.z ?? 0;
  const k = o.k ?? 1;
  const pc = st.paint(o.pot, C.terracotta);
  if (!o.z) st.shadowC(x, y, 0.2 * k, { h: 0.5, a: 0.2 });
  if (kind === 'monstera') {
    pot(st, x, y, z, 0.19 * k, 0.26 * k, pc);
    const [bx, by] = st.P(x, y, z + 0.26 * k);
    const L: [number, number, number, string][] = [
      [-2.5, 0.52, 0.2, C.leafDark],
      [-0.6, 0.5, 0.2, C.leafDark],
      [-1.95, 0.6, 0.22, C.leaf],
      [-1.15, 0.62, 0.23, C.leaf],
      [-2.85, 0.42, 0.18, C.leaf2],
      [-0.25, 0.42, 0.18, C.leaf2],
      [-1.55, 0.7, 0.24, C.leaf2],
    ];
    for (const [a, len, w, col] of L) {
      const ex = bx + Math.cos(a) * len * 0.45 * s * k;
      const ey = by + Math.sin(a) * len * 0.45 * s * k;
      c.beginPath();
      c.moveTo(bx, by);
      c.lineTo(ex, ey);
      c.strokeStyle = C.leafDark;
      c.lineWidth = Math.max(0.8, s / 40);
      c.stroke();
      leaf(st, ex, ey, len * 0.62 * s * k, a, w * 0.62 * s * k, col, dk(col, 0.14));
    }
  } else if (kind === 'tree') {
    pot(st, x, y, z, 0.2 * k, 0.28 * k, pc);
    st.line([x, y, z + 0.28 * k], [x, y, z + 0.95 * k], C.walnut, Math.max(1.4, s / 22));
    const balls: [number, number, number, number, string][] = [
      [-0.12, 0.02, 0.98, 0.2, C.leafDark],
      [0.12, -0.06, 1.02, 0.2, C.leaf],
      [0, 0.1, 1.08, 0.22, C.leaf],
      [-0.05, -0.05, 1.26, 0.2, C.leaf2],
      [0.1, 0.08, 1.2, 0.17, C.leaf2],
    ];
    for (const [dx, dy, dz, r, col] of balls) st.sph(x + dx * k, y + dy * k, z + dz * k, r * k, col);
  } else if (kind === 'snake') {
    pot(st, x, y, z, 0.15 * k, 0.2 * k, pc);
    const [bx, by] = st.P(x, y, z + 0.2 * k);
    const L: [number, number, string][] = [
      [-1.95, 0.5, C.leafDark],
      [-1.2, 0.56, C.leafDark],
      [-1.72, 0.74, C.leaf],
      [-1.42, 0.66, C.leaf2],
      [-1.58, 0.84, C.leaf],
    ];
    for (const [a, len, col] of L) leaf(st, bx + Math.cos(a) * 2, by, len * s * k, a, 0.055 * s * k, col, lt(col, 0.3));
  } else if (kind === 'cactus') {
    pot(st, x, y, z, 0.11 * k, 0.13 * k, pc);
    st.cyl(x, y, z + 0.13 * k, 0.065 * k, 0.24 * k, C.leaf);
    st.sph(x, y, z + 0.37 * k, 0.065 * k, C.leaf);
    st.cyl(x + 0.09 * k, y, z + 0.22 * k, 0.035 * k, 0.1 * k, C.leaf2);
    st.sph(x + 0.09 * k, y, z + 0.32 * k, 0.035 * k, C.leaf2);
  } else if (kind === 'flowers') {
    st.cone(x, y, z, 0.05 * k, 0.075 * k, 0.2 * k, st.paint(o.vase, C.water), { topFill: lt(C.water, 0.4) });
    const [bx, by] = st.P(x, y, z + 0.2 * k);
    const F: [number, number, string][] = [
      [-1.9, 0.3, C.coral],
      [-1.2, 0.32, C.mustard],
      [-1.6, 0.4, C.coralLight],
      [-2.3, 0.24, C.white],
      [-0.85, 0.24, C.coral],
    ];
    for (const [a, len, col] of F) {
      const ex = bx + Math.cos(a) * len * s * k;
      const ey = by + Math.sin(a) * len * s * k;
      c.beginPath();
      c.moveTo(bx, by);
      c.lineTo(ex, ey);
      c.strokeStyle = C.leaf;
      c.lineWidth = Math.max(0.7, s / 50);
      c.stroke();
      c.beginPath();
      c.arc(ex, ey, 0.055 * s * k, 0, TAU);
      c.fillStyle = col;
      c.fill();
      c.beginPath();
      c.arc(ex, ey, 0.02 * s * k, 0, TAU);
      c.fillStyle = C.mustard;
      c.fill();
    }
  } else if (kind === 'trail') {
    pot(st, x, y, z, 0.1 * k, 0.12 * k, st.paint(o.pot, C.cream));
    st.sph(x, y, z + 0.17 * k, 0.11 * k, C.leaf);
    st.sph(x + 0.07 * k, y + 0.03, z + 0.14 * k, 0.08 * k, C.leaf2);
    const [bx, by] = st.P(x, y, z + 0.12 * k);
    for (const [dx, len] of [
      [-0.12, 0.42],
      [0.1, 0.56],
      [0.02, 0.3],
    ]) {
      c.beginPath();
      c.moveTo(bx + dx * s, by);
      c.quadraticCurveTo(bx + dx * s * 1.8, by + len * s * 0.5, bx + dx * s * 1.4, by + len * s);
      c.strokeStyle = C.leaf;
      c.lineWidth = Math.max(0.8, s / 45);
      c.stroke();
      for (let i = 1; i <= 3; i++) {
        c.beginPath();
        c.arc(bx + dx * s * (1 + (0.5 * i) / 3), by + (len * s * i) / 3, 0.035 * s, 0, TAU);
        c.fillStyle = i % 2 ? C.leaf2 : C.leaf;
        c.fill();
      }
    }
  } else {
    pot(st, x, y, z, 0.07 * k, 0.09 * k, pc);
    st.sph(x, y, z + 0.14 * k, 0.08 * k, C.leaf2);
    st.sph(x + 0.04, y - 0.02, z + 0.17 * k, 0.06 * k, C.leaf);
  }
}
