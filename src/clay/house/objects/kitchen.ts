/**
 * @file kitchen.ts
 * @description The kitchen of the house pictures: runs of base cabinets (fronts toward us, or seen from behind along the front edge), an island, wall cabinets with a light underneath, a sink, a hob that cooks (a lit ring, a pan and steam), a tall unit of two ovens that glow while heating, a fridge with notes, a coffee machine (a green light and steam when ready), a dishwasher (blue while it runs), storage jars and a chopping board.
 * Ported from hearth-concept/clay2/things-b.js (kitchen).
 * Used by: items.ts.
 */
import { WARM, dk, type Paint } from '../colors';
import { TAU, rr, type Stage } from '../stage';
import { steam } from './effects';
import { mug, type On } from './furniture';
import { quadY } from './wall';

const GREEN = '#63BE84';

function doorLines(st: Stage, x: number, y: number, w: number, h: number, n: number, col: string): void {
  for (let i = 1; i < n; i++) st.line([x + (w * i) / n, y, 0.07], [x + (w * i) / n, y, h - 0.02], dk(col, 0.16), st.lw(1));
  for (let i = 0; i < n; i++) st.line([x + (w * (i + 0.5)) / n - 0.05, y, h - 0.08], [x + (w * (i + 0.5)) / n + 0.05, y, h - 0.08], st.col.ochre, st.lw(1.6));
}

export interface CabinetOpts {
  col?: Paint;
  top?: Paint;
  h?: number;
  doors?: number;
  /** Draws appliances into the fronts: (y of the fronts, height). */
  fronts?: (yy: number, h: number) => void;
  on?: On;
  bias?: number;
}

/** A run of base cabinets along the right wall, fronts toward us. */
export function cabY(st: Stage, x: number, y: number, w: number, d: number, o: CabinetOpts = {}): void {
  st.add(
    x + w / 2,
    y + d / 2,
    () => {
      const col = st.paint(o.col, st.col.sage);
      const h = o.h ?? 0.46;
      st.shadowR(x, y, w, d, { h, a: 0.16, r: 0.02 });
      st.box(x, y, 0, w, d - 0.03, 0.05, st.col.graphite, { flat: true });
      st.box(x, y, 0.05, w, d, h - 0.05, col);
      doorLines(st, x, y + d + 0.003, w, h, o.doors ?? Math.max(1, Math.round(w / 0.5)), col);
      o.fronts?.(y + d + 0.004, h);
      st.rbox(x - 0.02, y, h, w + 0.04, d + 0.03, 0.04, 0.015, st.paint(o.top, st.col.stone));
      o.on?.(h + 0.04);
    },
    o.bias ?? 0,
  );
}

/** A run of cabinets along the front edge; we see its plain back. */
export function cabX(st: Stage, x: number, y: number, w: number, d: number, o: CabinetOpts = {}): void {
  st.add(
    x + w / 2,
    y + d / 2,
    () => {
      const h = o.h ?? 0.46;
      st.shadowR(x, y, w, d, { h, a: 0.16, r: 0.02 });
      st.box(x, y, 0.0, w, d, h, st.paint(o.col, st.col.sage));
      st.rbox(x - 0.02, y - 0.02, h, w + 0.04, d + 0.04, 0.04, 0.015, st.paint(o.top, st.col.stone));
      o.on?.(h + 0.04);
    },
    o.bias ?? 0,
  );
}

export function island(st: Stage, x: number, y: number, w: number, d: number, o: CabinetOpts = {}): void {
  st.add(x + w / 2, y + d / 2, () => {
    const col = st.paint(o.col, st.col.sageDeep);
    const h = 0.46;
    st.shadowR(x, y, w, d, { h, a: 0.2, r: 0.04 });
    st.rbox(x + 0.03, y + 0.03, 0, w - 0.06, d - 0.06, 0.05, 0.03, st.col.graphite, { flat: true });
    st.rbox(x, y, 0.05, w, d, h - 0.05, 0.04, col);
    doorLines(st, x + 0.04, y + d + 0.003, w - 0.08, h, 3, col);
    st.rbox(x - 0.05, y - 0.05, h, w + 0.1, d + 0.1, 0.045, 0.05, st.paint(o.top, st.col.oak));
    o.on?.(h + 0.045);
  });
}

export function sink(st: Stage, x: number, y: number, z: number): void {
  const C = st.col;
  st.fill(rr(x, y, 0.42, 0.3, 0.05).map((p) => [p[0], p[1], z + 0.002] as const), C.grey);
  st.fill(rr(x + 0.03, y + 0.03, 0.36, 0.24, 0.04).map((p) => [p[0], p[1], z + 0.003] as const), C.greyDeep);
  st.pline([[x + 0.21, y - 0.02, z], [x + 0.21, y - 0.02, z + 0.2], [x + 0.21, y + 0.1, z + 0.2], [x + 0.21, y + 0.1, z + 0.15]], C.chrome, st.lw(2));
}

/** The hob; cooking puts a pan on a lit ring, with steam. */
export function hob(st: Stage, x: number, y: number, z: number, cooking = false): void {
  const C = st.col;
  st.fill(rr(x, y, 0.4, 0.56, 0.03).map((p) => [p[0], p[1], z + 0.002] as const), C.ink);
  for (const [a, b] of [
    [0.11, 0.15],
    [0.29, 0.15],
    [0.11, 0.41],
    [0.29, 0.41],
  ])
    st.ring(x + a, y + b, z + 0.004, 0.07, '#77716A', st.lw(1));
  if (!cooking) return;
  st.ring(x + 0.29, y + 0.41, z + 0.004, 0.08, '#FF8A66', st.lw(2));
  const p = new Path2D();
  const [a, b] = st.P(x + 0.29, y + 0.41, z);
  p.ellipse(a, b, 0.11 * st.s, 0.065 * st.s, 0, 0, TAU);
  st.emit(p, '#FFFFFF');
  st.cyl(x + 0.29, y + 0.41, z + 0.005, 0.1, 0.1, C.graphite, { topFill: '#C9B48E' });
  st.line([x + 0.39, y + 0.41, z + 0.09], [x + 0.52, y + 0.41, z + 0.09], C.ink, st.lw(2));
  steam(st, x + 0.29, y + 0.41, z + 0.16, 1.1);
  st.cyl(x + 0.11, y + 0.15, z + 0.005, 0.085, 0.04, C.ink);
}

/** Wall cabinets on the right wall; `glow` (0 to 1) lights the worktop under them. */
export function upperY(st: Stage, x0: number, x1: number, z0: number, z1: number, o: { col?: Paint; doors?: number; glow?: number } = {}): void {
  st.add(
    (x0 + x1) / 2,
    0.16,
    () => {
      const C = st.col;
      const col = st.paint(o.col, C.cream);
      const n = o.doors ?? Math.max(1, Math.round((x1 - x0) / 0.5));
      st.wallShadow(quadY(x0 + 0.04, x1 + 0.04, z0 - 0.16, z0, 0.012), 0.1);
      st.box(x0, 0.012, z0, x1 - x0, 0.3, z1 - z0, col);
      for (let i = 1; i < n; i++) st.line([x0 + ((x1 - x0) * i) / n, 0.314, z0 + 0.02], [x0 + ((x1 - x0) * i) / n, 0.314, z1 - 0.02], dk(col, 0.14), st.lw(1));
      for (let i = 0; i < n; i++) st.line([x0 + ((x1 - x0) * (i + 0.5)) / n, 0.315, z0 + 0.03], [x0 + ((x1 - x0) * (i + 0.5)) / n, 0.315, z0 + 0.1], C.ochre, st.lw(1.6));
      if (!o.glow) return;
      st.emit(
        st.fill(
          [
            [x0 + 0.02, 0.3, z0 - 0.006],
            [x1 - 0.02, 0.3, z0 - 0.006],
            [x1 - 0.02, 0.26, z0 - 0.006],
            [x0 + 0.02, 0.26, z0 - 0.006],
          ],
          '#FFF1DC',
        ),
      );
      for (let i = 0; i < 3; i++) st.light(x0 + ((x1 - x0) * (i + 0.5)) / 3, 0.3, 0.6, { r: 1.0, col: WARM, a: 0.85 * o.glow });
      st.halo((x0 + x1) / 2, 0.3, z0 - 0.05, (x1 - x0) * 0.45, WARM, 0.22 * o.glow);
    },
    -4,
  );
}

/** A tall unit with two ovens stacked; each glows while it heats. */
export function ovenTower(st: Stage, x: number, y: number, o: { col?: Paint; steam?: boolean; combi?: boolean } = {}): void {
  st.add(x + 0.32, y + 0.31, () => {
    const C = st.col;
    const col = st.paint(o.col, C.sage);
    const w = 0.64;
    const d = 0.62;
    const h = 1.3;
    const yy = y + d + 0.004;
    st.shadowR(x, y, w, d, { h: 0.9, a: 0.18, r: 0.02 });
    st.box(x, y, 0, w, d, h, col);
    st.line([x + 0.03, yy, 0.3], [x + w - 0.03, yy, 0.3], dk(col, 0.16), st.lw(1));
    for (const [z0, on] of [
      [0.36, !!o.steam],
      [0.82, !!o.combi],
    ] as const) {
      st.fill(quadY(x + 0.05, x + w - 0.05, z0, z0 + 0.4, yy), C.ink);
      const q = quadY(x + 0.09, x + w - 0.09, z0 + 0.05, z0 + 0.28, yy + 0.001);
      if (on) {
        st.c.fillStyle = st.K.grad([x, yy, z0 + 0.28], [x, yy, z0 + 0.05], '#FFD08A', '#F0703C');
        const p = st.path(q);
        st.c.fill(p);
        st.emit(p, '#FFFFFF');
        st.light(x + w / 2, y + d + 0.5, 0.5, { r: 1.5, col: [255, 150, 80], a: 0.75 });
        st.halo(x + w / 2, yy, z0 + 0.16, 0.42, [255, 150, 80], 0.5);
      } else st.fill(q, '#4A4642');
      st.line([x + 0.1, yy + 0.002, z0 + 0.335], [x + w - 0.1, yy + 0.002, z0 + 0.335], C.chrome, st.lw(1.8));
    }
  });
}

export function fridge(st: Stage, x: number, y: number, o: { col?: Paint } = {}): void {
  st.add(x + 0.32, y + 0.31, () => {
    const C = st.col;
    const w = 0.66;
    const d = 0.62;
    const h = 1.3;
    const col = st.paint(o.col, C.chrome);
    const yy = y + d + 0.004;
    st.shadowR(x, y, w, d, { h: 0.9, a: 0.18, r: 0.02 });
    st.rbox(x, y, 0, w, d, h, 0.03, col);
    st.line([x + 0.02, yy, 0.5], [x + w - 0.02, yy, 0.5], dk(col, 0.2), st.lw(1));
    st.line([x + w - 0.1, yy, 0.56], [x + w - 0.1, yy, 0.9], C.greyDeep, st.lw(2));
    st.line([x + w - 0.1, yy, 0.3], [x + w - 0.1, yy, 0.44], C.greyDeep, st.lw(2));
    st.fill(quadY(x + 0.1, x + 0.24, 0.86, 1.04, yy), C.mustard);
    st.fill(quadY(x + 0.27, x + 0.38, 0.92, 1.06, yy), C.coralLight);
    st.fill(quadY(x + 0.14, x + 0.3, 0.64, 0.8, yy), C.white);
  });
}

/** A coffee machine with a mug; ready shows a green light and steam. */
export function coffee(st: Stage, x: number, y: number, z: number, ready = false): void {
  const C = st.col;
  st.rbox(x, y, z, 0.26, 0.3, 0.3, 0.03, C.ink);
  st.fill(quadY(x + 0.04, x + 0.22, z + 0.06, z + 0.2, y + 0.302), '#5B5551');
  st.fill(quadY(x + 0.04, x + 0.22, z + 0.22, z + 0.27, y + 0.302), C.chrome);
  mug(st, x + 0.13, y + 0.36, z, C.white);
  if (!ready) return;
  const [a, b] = st.P(x + 0.2, y + 0.303, z + 0.245);
  st.c.beginPath();
  st.c.arc(a, b, st.lw(1.5), 0, TAU);
  st.c.fillStyle = GREEN;
  st.c.fill();
  steam(st, x + 0.13, y + 0.36, z + 0.1, 0.6, 2);
}

/** A dishwasher front between x0 and x1 in a run's fronts at yy; its light is blue while it runs. */
export function dishwasher(st: Stage, x0: number, x1: number, yy: number, h: number, running = false): void {
  const C = st.col;
  st.fill(quadY(x0, x1, 0.07, h - 0.02, yy), C.chrome);
  st.line([x0 + 0.05, yy + 0.001, h - 0.08], [x1 - 0.05, yy + 0.001, h - 0.08], C.greyDeep, st.lw(2));
  const [a, b] = st.P(x1 - 0.07, yy + 0.002, h - 0.14);
  st.c.beginPath();
  st.c.arc(a, b, st.lw(1.4), 0, TAU);
  st.c.fillStyle = running ? '#5E9BE0' : GREEN;
  st.c.fill();
}

/** Three storage jars; left out of the sparsest styles. */
export function jars(st: Stage, x: number, y: number, z: number): void {
  if (st.style.sparse === true) return;
  const C = st.col;
  const list: [number, string, string, number][] = [
    [0, C.cream, C.oak, 0.14],
    [0.11, C.glass, C.coralLight, 0.11],
    [0.21, C.glass, C.mustard, 0.09],
  ];
  for (const [dx, col, lid, h] of list) {
    st.cyl(x + dx, y, z, 0.04, h, col);
    st.cyl(x + dx, y, z + h, 0.043, 0.02, lid);
  }
}

/** A chopping board with a tomato and a lime; left out of the sparsest styles. */
export function board(st: Stage, x: number, y: number, z: number): void {
  if (st.style.sparse === true) return;
  const C = st.col;
  st.rbox(x, y, z, 0.3, 0.2, 0.02, 0.03, C.oak);
  st.sph(x + 0.1, y + 0.1, z + 0.05, 0.04, C.coral);
  st.sph(x + 0.19, y + 0.08, z + 0.045, 0.035, C.leaf2);
}
