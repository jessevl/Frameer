/**
 * @file outdoor.ts
 * @description Outdoor things for the house pictures and their close-ups: shrubs, a garden tree, bollards and a lantern that light the path, wheelie bins, a heat pump (moving air while it runs), a wall box on its post (idle, waiting or charging), a car whose tail and charge port show the same, a garden seat, a string of lights on two posts, a front door with its mat, and a shipping container (a stack of them is how a yard shows an app).
 * Ported from hearth-concept/clay2/things-b.js (outdoors), house.js (seat, string of lights, door) and scenes.js (container).
 * Used by: items.ts, house.ts (the plot), the examples.
 */
import { WARM, dk, hexOf, lt, type Paint, type RGB } from '../colors';
import { TAU, rr, type Stage } from '../stage';
import { air } from './effects';
import { circX, circY, quadX, quadY } from './wall';

const GREEN = '#63BE84';

export function shrub(st: Stage, x: number, y: number, k = 1, colP?: Paint): void {
  st.add(x, y, () => {
    const col = st.paint(colP, st.col.leaf);
    st.shadowC(x, y, 0.3 * k, { h: 0.3, a: 0.2 });
    st.sph(x - 0.12 * k, y, 0.17 * k, 0.2 * k, dk(col, 0.08));
    st.sph(x + 0.1 * k, y - 0.05 * k, 0.2 * k, 0.22 * k, col);
    st.sph(x, y + 0.1 * k, 0.22 * k, 0.2 * k, lt(col, 0.14));
  });
}

export function gardenTree(st: Stage, x: number, y: number, k = 1): void {
  st.add(x, y, () => {
    const C = st.col;
    st.shadowC(x, y, 0.5 * k, { h: 0.8, a: 0.22 });
    st.cyl(x, y, 0, 0.055 * k, 0.75 * k, C.walnut);
    const balls: [number, number, number, number, string][] = [
      [-0.22, 0, 0.9, 0.36, C.leafDark],
      [0.2, -0.1, 0.95, 0.36, C.leaf],
      [0, 0.18, 1.05, 0.38, C.leaf],
      [-0.05, -0.05, 1.35, 0.32, C.leaf2],
    ];
    for (const [dx, dy, dz, r, col] of balls) st.sph(x + dx * k, y + dy * k, dz * k, r * k, col);
  });
}

/** A path light; on, it lights the ground around it. */
export function bollard(st: Stage, x: number, y: number, on = false): void {
  st.add(x, y, () => {
    const C = st.col;
    st.cyl(x, y, 0, 0.05, 0.36, C.graphite);
    st.cyl(x, y, 0.36, 0.06, 0.06, on ? '#FFE9C8' : C.grey);
    st.cyl(x, y, 0.42, 0.065, 0.02, C.graphite);
    if (!on) return;
    st.emitC(x, y, 0.39, 0.08);
    st.light(x, y, 0.05, { r: 1.25, col: WARM, a: 0.9, clip: null });
    st.halo(x, y, 0.39, 0.3, WARM, 0.55);
  });
}

/** A lantern on a post (by a door); on, it lights the ground around it. */
export function lantern(st: Stage, x: number, y: number, on = false): void {
  st.add(x, y, () => {
    const C = st.col;
    st.cyl(x, y, 0, 0.035, 0.8, C.graphite);
    st.rbox(x - 0.08, y - 0.08, 0.8, 0.16, 0.16, 0.2, 0.03, on ? '#FFE9C8' : C.cream);
    st.cone(x, y, 1.0, 0.13, 0.02, 0.07, C.graphite);
    if (!on) return;
    st.emitC(x, y, 0.9, 0.15);
    st.light(x, y, 0.1, { r: 1.7, col: WARM, a: 1, clip: null });
    st.halo(x, y, 0.9, 0.42, WARM, 0.6);
  });
}

export function bin(st: Stage, x: number, y: number, colP?: Paint): void {
  st.add(x + 0.18, y + 0.2, () => {
    const col = st.paint(colP, st.col.graphite);
    st.shadowR(x, y, 0.36, 0.4, { h: 0.5, a: 0.18 });
    st.rbox(x, y, 0.03, 0.36, 0.4, 0.5, 0.05, col);
    st.rbox(x - 0.015, y - 0.015, 0.53, 0.39, 0.43, 0.04, 0.06, dk(col, 0.1));
  });
}

/** The heat pump's outdoor unit, fan toward us; air moves while it runs. */
export function heatPump(st: Stage, x: number, y: number, running = false): void {
  st.add(x + 0.48, y + 0.21, () => {
    const C = st.col;
    const w = 0.96;
    const d = 0.42;
    const h = 0.74;
    const yy = y + d + 0.004;
    st.shadowR(x, y, w, d, { h: 0.5, a: 0.2 });
    for (const a of [0.1, w - 0.16]) st.box(x + a, y + 0.04, 0, 0.06, d - 0.08, 0.06, C.graphite, { flat: true });
    st.rbox(x, y, 0.06, w, d, h, 0.04, C.white);
    st.fill(circY(x + 0.36, 0.44, 0.28, yy), C.grey);
    st.fill(circY(x + 0.36, 0.44, 0.24, yy + 0.001), C.graphite);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU + 0.5;
      st.line([x + 0.36, yy + 0.002, 0.44], [x + 0.36 + Math.cos(a) * 0.21, yy + 0.002, 0.44 + Math.sin(a) * 0.21], C.chrome, st.lw(3));
    }
    for (const r of [0.12, 0.2]) {
      const ring = circY(x + 0.36, 0.44, r, yy + 0.003);
      st.pline(ring.concat([ring[0]]), '#8A847C', st.lw(0.8));
    }
    for (let i = 0; i < 5; i++) st.line([x + 0.72, yy, 0.2 + i * 0.1], [x + 0.9, yy, 0.2 + i * 0.1], C.grey, st.lw(1.2));
    if (running) air(st, x + 0.36, y + d + 0.3, 0.44, 1.3, 1);
  });
}

/** What a charger and a car show. */
export type ChargeState = 'idle' | 'waiting' | 'charging';

const chargeRgb = (state: ChargeState): RGB => (state === 'charging' ? [99, 190, 132] : state === 'waiting' ? [240, 180, 80] : [200, 200, 200]);

/** A wall box on its post; idle shows its cable coiled on the ground. */
export function wallbox(st: Stage, x: number, y: number, state: ChargeState = 'idle'): void {
  st.add(x, y, () => {
    const C = st.col;
    const col = chargeRgb(state);
    st.box(x - 0.05, y - 0.05, 0, 0.1, 0.1, 0.72, C.graphite, { flat: true });
    st.rbox(x - 0.12, y - 0.07, 0.72, 0.24, 0.14, 0.36, 0.05, C.white);
    const p = st.fill(quadY(x - 0.07, x + 0.07, 0.94, 0.98, y + 0.074), hexOf(col));
    if (state !== 'idle') {
      st.emit(p, '#FFFFFF');
      st.halo(x, y + 0.08, 0.96, 0.22, col, 0.6);
    } else st.ring(x + 0.2, y + 0.02, 0.012, 0.13, C.ink, st.lw(2.2));
  });
}

export interface CarOpts {
  col?: Paint;
  /** Parked (`home`), plugged in and waiting, or charging. */
  state?: 'home' | 'waiting' | 'charging';
  /** Where the wall box is, for the cable. */
  cable?: readonly [number, number] | null;
}

/** A car, nose toward the back; we see its right side and its tail. */
export function car(st: Stage, x: number, y: number, o: CarOpts = {}): void {
  st.add(x + 0.8, y + 1.75, () => {
    const C = st.col;
    const c = st.c;
    const w = 1.6;
    const L = 3.5;
    const col = st.paint(o.col, '#F3F1EE');
    const xx = x + w + 0.004;
    st.shadow(rr(x, y, w, L, 0.4), { h: 0.5, a: 0.3, blur: 0.14 });
    for (const yy of [y + 0.72, y + L - 0.72]) {
      st.fill(circX(yy, 0.2, 0.21, xx - 0.03), '#2B2826');
      st.fill(circX(yy, 0.2, 0.1, xx - 0.028), C.steel);
    }
    st.prism(rr(x, y, w, L, 0.36, 6), 0.14, 0.3, col, { soft: 0.25 });
    for (const yy of [y + 0.72, y + L - 0.72]) {
      c.save();
      c.clip(st.path(quadX(yy - 0.3, yy + 0.3, 0.02, 0.4, xx)));
      st.fill(circX(yy, 0.2, 0.25, xx), '#3A3633');
      st.fill(circX(yy, 0.2, 0.21, xx + 0.001), '#2B2826');
      st.fill(circX(yy, 0.2, 0.1, xx + 0.002), C.steel);
      c.restore();
    }
    st.prism(rr(x + 0.14, y + 0.82, w - 0.28, L - 1.55, 0.28, 6), 0.44, 0.22, '#64717E', { top: lt(col, 0.2), edge: 0.5 });
    st.fill(rr(x + 0.3, y + 1.16, w - 0.6, L - 2.3, 0.2, 6).map((p) => [p[0], p[1], 0.662] as const), '#2F3740');
    st.line([x + 0.42, y + 1.3, 0.664], [x + w * 0.56, y + L - 1.45, 0.664], '#FFFFFF', st.lw(3), 0.18);
    st.line([x + 0.3, y + 0.52, 0.442], [x + w - 0.3, y + 0.52, 0.442], dk(col, 0.1), st.lw(1), 0.8);
    st.fill(quadY(x + 0.5, x + w - 0.42, 0.34, 0.375, y + L + 0.004), o.state === 'charging' ? '#F0705A' : '#B9483A');
    if (!o.state || o.state === 'home') return;
    const px = x + 0.3;
    const py = y + L + 0.006;
    const [a, bb] = st.P(px, py, 0.4);
    if (o.cable) {
      const [wx0, wy0] = o.cable;
      st.pline([[wx0, wy0 + 0.08, 0.76], [wx0, wy0 + 0.22, 0.06], [px - 0.2, py + 0.5, 0.02], [px, py + 0.2, 0.05], [px, py, 0.4]], C.ink, st.lw(2.2));
    }
    c.beginPath();
    c.arc(a, bb, st.lw(2.4), 0, TAU);
    c.fillStyle = o.state === 'charging' ? GREEN : '#F0B450';
    c.fill();
    const e = new Path2D();
    e.arc(a, bb, st.lw(3.2), 0, TAU);
    st.emit(e, '#FFFFFF');
    st.halo(px, py, 0.4, 0.22, chargeRgb(o.state), 0.6);
  });
}

/** A low garden seat with a cushion. */
export function gardenSeat(st: Stage, x: number, y: number, o: { col?: Paint; cushion?: Paint } = {}): void {
  st.add(x + 0.4, y + 0.35, () => {
    const C = st.col;
    const col = st.paint(o.col, C.linen);
    st.shadowR(x, y, 0.8, 0.7, { h: 0.3, a: 0.2 });
    for (const [a, b] of [
      [0.06, 0.06],
      [0.7, 0.06],
      [0.06, 0.6],
      [0.7, 0.6],
    ])
      st.cyl(x + a, y + b, 0, 0.025, 0.1, C.walnut);
    st.rbox(x, y, 0.1, 0.8, 0.7, 0.14, 0.12, col, { soft: 0.4 });
    st.rbox(x, y, 0.24, 0.8, 0.2, 0.3, 0.08, col);
    st.rbox(x + 0.25, y + 0.26, 0.24, 0.3, 0.12, 0.2, 0.05, st.paint(o.cushion, C.coralLight), { soft: 0.4 });
  });
}

/** A string of lights on two posts, from x0 to x1 along y; on, the bulbs glow and light the ground. */
export function stringLights(st: Stage, x0: number, x1: number, y: number, on = false, o: { h?: number; bulbs?: number } = {}): void {
  st.add(x1 + 0.1, y + 0.05, () => {
    const C = st.col;
    const h = o.h ?? 1.15;
    const n = o.bulbs ?? 12;
    for (const x of [x0, x1]) st.cyl(x, y, 0, 0.03, h, C.walnut);
    const pts = Array.from({ length: n + 1 }, (_, i) => [x0 + ((x1 - x0) * i) / n, y, h - Math.sin((i / n) * Math.PI) * 0.26] as const);
    st.pline(pts, C.graphite, Math.max(0.7, st.s / 50));
    pts.slice(1, -1).forEach((p, i) => {
      if (i % 2) return;
      st.sph(p[0], p[1], p[2] - 0.05, 0.04, on ? '#FFE9C0' : C.cream);
      if (on) {
        st.emitC(p[0], p[1], p[2] - 0.05, 0.05);
        st.halo(p[0], p[1], p[2] - 0.05, 0.2, WARM, 0.55);
      }
    });
    if (on) for (const t of [0.206, 0.524, 0.81]) st.light(x0 + (x1 - x0) * t, y - 0.35, 0.1, { r: 1.5, col: WARM, a: 0.55, clip: null });
  });
}

/** A front door on the plane x = at, from y over 0.7, standing on z, with a mat in front of it. */
export function frontDoor(st: Stage, at: number, y: number, z = 0, o: { col?: Paint; mat?: Paint } = {}): void {
  st.add(
    at,
    y + 0.11,
    () => {
      const C = st.col;
      st.box(at, y, z, 0.05, 0.7, 0.62, st.paint(o.col, C.terracotta));
      st.line([at + 0.053, y + 0.56, z + 0.3], [at + 0.053, y + 0.56, z + 0.4], C.ochre, 2);
      st.fill(rr(at + 0.12, y + 0.02, 0.62, 0.3, 0.04).map((p) => [p[0], p[1], z + 0.002] as const), st.paint(o.mat, C.graphite));
    },
    -0.4,
  );
}

export const CONTAINER = { L: 1.25, D: 0.5, H: 0.46 };

/** A shipping container on (x, y, z): ribs along its long side, doors on its end, a label if asked. */
export function container(st: Stage, x: number, y: number, z: number, colP: Paint, o: { label?: boolean } = {}): void {
  const { L, D: Dp, H } = CONTAINER;
  const col = st.paint(colP, st.col.blue);
  const lw = (k: number) => Math.max(0.6, (k * st.s) / 50);
  st.rbox(x, y, z, L, Dp, H, 0.02, col, { soft: 0.2 });
  const fy = y + Dp + 0.003;
  const ex = x + L + 0.003;
  const rib = dk(col, 0.1);
  const hi = lt(col, 0.25);
  for (let i = 1; i < 14; i++) st.line([x + (i * L) / 14, fy, z + 0.03], [x + (i * L) / 14, fy, z + H - 0.03], i % 2 ? rib : hi, lw(1), 0.8);
  st.fill([[ex, y + 0.05, z + 0.05], [ex, y + Dp - 0.05, z + 0.05], [ex, y + Dp - 0.05, z + H - 0.05], [ex, y + 0.05, z + H - 0.05]], dk(col, 0.05));
  st.line([ex + 0.001, y + Dp / 2, z + 0.05], [ex + 0.001, y + Dp / 2, z + H - 0.05], dk(col, 0.2), lw(1));
  for (const yy of [y + Dp * 0.3, y + Dp * 0.7]) st.line([ex + 0.002, yy, z + 0.1], [ex + 0.002, yy, z + H - 0.1], dk(col, 0.25), lw(1.4));
  if (o.label) st.fill([[x + 0.12, fy + 0.001, z + H - 0.2], [x + 0.32, fy + 0.001, z + H - 0.2], [x + 0.32, fy + 0.001, z + H - 0.08], [x + 0.12, fy + 0.001, z + H - 0.08]], lt(col, 0.55));
}
