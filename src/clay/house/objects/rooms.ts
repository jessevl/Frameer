/**
 * @file rooms.ts
 * @description Bedroom, storage, children's, bathroom and laundry things for the house pictures: a bed with sleepers (awake ones show a face), nightstands, dressers, bookcases with spines, an open wardrobe, a laundry basket, toy blocks, a teddy, a play tent, a bath (full shows water and steam), a vanity, a toilet, a walk-in shower (running shows water and steam), a washing machine (running shows a lit drum), a drying rack, and stairs with a rail.
 * Ported from hearth-concept/clay2/things-b.js (beds and storage, bathroom, stairs) and the washer and rack of house.js.
 * Used by: items.ts.
 */
import { mix } from '../../../icons/palette';
import { dk, lt, type Paint } from '../colors';
import { TAU, circ, hsh, rr, type Stage } from '../stage';
import { steam } from './effects';
import type { On } from './furniture';
import { plant } from './plants';
import { circY, quadX, quadY } from './wall';

/** Someone in bed: where across it (0 to 1), their hair, size, and whether they are awake (their face shows). */
export interface Sleeper {
  t: number;
  hair?: Paint;
  k?: number;
  awake?: boolean;
}

export interface BedOpts {
  duvet?: Paint;
  frame?: Paint;
  head?: Paint;
  headH?: number;
  sleepers?: readonly Sleeper[];
  /** Dots on the duvet, in this colour. */
  dots?: Paint;
  throwCol?: Paint;
}

/** A bed with its head against the right wall. */
export function bed(st: Stage, x: number, y: number, w: number, d: number, o: BedOpts = {}): void {
  st.add(x + w / 2, y + d / 2, () => {
    const C = st.col;
    const c = st.c;
    const duvet = st.paint(o.duvet, C.sageLight);
    st.shadowR(x - 0.04, y, w + 0.08, d + 0.04, { h: 0.4, a: 0.2 });
    st.rbox(x - 0.04, y, 0, w + 0.08, d + 0.05, 0.14, 0.06, st.paint(o.frame, C.oak));
    st.rbox(x - 0.07, y, 0, w + 0.14, 0.12, o.headH ?? 0.8, 0.05, st.paint(o.head, C.linenDeep), { soft: 0.25 });
    st.rbox(x, y + 0.12, 0.14, w, d - 0.12, 0.14, 0.08, C.cream);
    const n = w > 1.2 ? 2 : 1;
    const pw = (w - 0.16) / n;
    for (let i = 0; i < n; i++) st.rbox(x + 0.08 + i * pw + 0.03, y + 0.16, 0.28, pw - 0.06, 0.34, 0.09, 0.09, C.white, { soft: 0.5 });
    for (const q of o.sleepers ?? []) {
      const k = q.k ?? 1;
      const px = x + 0.08 + q.t * (w - 0.16);
      st.sph(px, y + 0.36, 0.36 + 0.09 * k, 0.115 * k, st.paint(q.hair, C.hairA));
      if (q.awake) {
        const [hx, hy] = st.P(px, y + 0.36, 0.45);
        const R = 0.115 * k * st.s;
        c.save();
        c.beginPath();
        c.arc(hx, hy, R, 0, TAU);
        c.clip();
        c.beginPath();
        c.arc(hx, hy + R * 0.46, R * 0.88, 0, TAU);
        c.fillStyle = C.skin;
        c.fill();
        c.restore();
      }
    }
    st.rbox(x - 0.02, y + d * 0.36, 0.27, w + 0.04, d * 0.64, 0.07, 0.1, duvet, { soft: 0.3 });
    for (const q of o.sleepers ?? []) {
      const k = q.k ?? 1;
      const px = x + 0.08 + q.t * (w - 0.16);
      st.rbox(px - 0.2 * k, y + d * 0.36 + 0.04, 0.33, 0.4 * k, Math.min(d * 0.6, 1.25 * k), 0.09, 0.16, duvet, { soft: 0.35 });
    }
    st.rbox(x - 0.02, y + d * 0.36, 0.34, w + 0.04, 0.2, 0.025, 0.08, lt(duvet, 0.5));
    if (o.dots) {
      const dots = st.paint(o.dots, C.cream);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) st.disc(x + 0.2 + (i * (w - 0.4)) / 3, y + d * 0.62 + (j * (d * 0.3)) / 2, 0.345, 0.04, dots);
    }
    if (o.throwCol) {
      const tc = st.paint(o.throwCol, C.mustard);
      st.rbox(x - 0.03, y + d - 0.4, 0.34, w + 0.06, 0.32, 0.03, 0.06, tc);
      for (let i = 1; i < 4; i++) st.line([x, y + d - 0.4 + i * 0.08, 0.372], [x + w, y + d - 0.4 + i * 0.08, 0.372], lt(tc, 0.4), st.lw(1), 0.8);
    }
  });
}

export function nightstand(st: Stage, x: number, y: number, o: { col?: Paint; on?: On } = {}): void {
  st.add(x + 0.18, y + 0.18, () => {
    const col = st.paint(o.col, st.col.oak);
    st.shadowR(x, y, 0.36, 0.36, { h: 0.3, a: 0.16 });
    st.rbox(x, y, 0.04, 0.36, 0.36, 0.3, 0.04, col);
    st.line([x + 0.04, y + 0.363, 0.2], [x + 0.32, y + 0.363, 0.2], dk(col, 0.16), st.lw(1));
    st.line([x + 0.14, y + 0.364, 0.27], [x + 0.22, y + 0.364, 0.27], st.col.ochre, st.lw(1.6));
    o.on?.(0.34);
  });
}

export interface DresserOpts {
  col?: Paint;
  h?: number;
  on?: On;
  bias?: number;
}

const knob = (st: Stage, p: [number, number]) => {
  st.c.beginPath();
  st.c.arc(p[0], p[1], st.lw(1.4), 0, TAU);
  st.c.fillStyle = st.col.ochre;
  st.c.fill();
};

/** Drawers along the left wall, fronts toward us on the right face. */
export function dresserX(st: Stage, x: number, y: number, w: number, d: number, o: DresserOpts = {}): void {
  st.add(x + w / 2, y + d / 2, () => {
    const col = st.paint(o.col, st.col.oak);
    const h = o.h ?? 0.5;
    st.shadowR(x, y, w, d, { h, a: 0.18 });
    st.rbox(x, y, 0.03, w, d, h, 0.03, col);
    const xx = x + w + 0.004;
    for (let i = 1; i < 3; i++) st.line([xx, y + 0.03, 0.03 + (h * i) / 3], [xx, y + d - 0.03, 0.03 + (h * i) / 3], dk(col, 0.18), st.lw(1));
    for (let i = 0; i < 3; i++) for (const t of [0.3, 0.7]) knob(st, st.P(xx, y + d * t, 0.03 + (h * (i + 0.5)) / 3));
    o.on?.(h + 0.03);
  });
}

/** Drawers along the right wall, fronts toward us. */
export function dresserY(st: Stage, x: number, y: number, w: number, d: number, o: DresserOpts = {}): void {
  st.add(
    x + w / 2,
    y + d / 2,
    () => {
      const col = st.paint(o.col, st.col.oak);
      const h = o.h ?? 0.5;
      st.shadowR(x, y, w, d, { h, a: 0.18 });
      st.rbox(x, y, 0.03, w, d, h, 0.03, col);
      const yy = y + d + 0.004;
      for (let i = 1; i < 3; i++) st.line([x + 0.03, yy, 0.03 + (h * i) / 3], [x + w - 0.03, yy, 0.03 + (h * i) / 3], dk(col, 0.18), st.lw(1));
      for (let i = 0; i < 3; i++) for (const t of [0.3, 0.7]) knob(st, st.P(x + w * t, yy, 0.03 + (h * (i + 0.5)) / 3));
      o.on?.(h + 0.03);
    },
    o.bias ?? 0,
  );
}

type Quad = typeof quadY;

/** Book spines filling a shelf's face, from a seed. */
function spines(st: Stage, Q: Quad, a0: number, a1: number, z0: number, z1: number, at: number, seed: number): void {
  const C = st.col;
  const cols = [C.coral, C.blue, C.mustard, C.sage, C.cream, C.blueDeep, C.terracotta, C.linenDeep];
  let a = a0 + 0.02;
  let i = 0;
  while (a < a1 - 0.05) {
    const w = 0.035 + hsh(seed + i) * 0.035;
    const h = (z1 - z0) * (0.62 + hsh(seed + i * 3.3) * 0.3);
    if (hsh(seed + i * 7.7) > 0.86) {
      a += 0.09;
      i++;
      continue;
    }
    st.fill(Q(a, Math.min(a + w, a1 - 0.02), z0, z0 + h, at), cols[Math.floor(hsh(seed + i * 1.7) * cols.length)]);
    a += w + 0.006;
    i++;
  }
}

export interface BookcaseOpts {
  col?: Paint;
  rows?: number;
  on?: On;
  bias?: number;
}

/** A bookcase along the left wall, shelves facing right. */
export function bookcaseX(st: Stage, x: number, y: number, w: number, d: number, h: number, o: BookcaseOpts = {}): void {
  st.add(x + w / 2, y + d / 2, () => {
    const col = st.paint(o.col, st.col.cream);
    const n = o.rows ?? 4;
    const xx = x + w + 0.003;
    st.shadowR(x, y, w, d, { h: 0.7, a: 0.18, r: 0.02 });
    st.box(x, y, 0, w, d, h, col);
    for (let i = 0; i < n; i++) {
      const z0 = 0.05 + ((h - 0.08) * i) / n;
      const z1 = 0.05 + ((h - 0.08) * (i + 1)) / n - 0.04;
      st.fill(quadX(y + 0.04, y + d - 0.04, z0, z1, xx), dk(col, 0.22));
      spines(st, quadX, y + 0.05, y + d - 0.05, z0, z1, xx + 0.001, i * 13 + y * 5);
    }
    o.on?.(h);
  });
}

/** A bookcase along the right wall, shelves facing us. */
export function bookcaseY(st: Stage, x: number, y: number, w: number, d: number, h: number, o: BookcaseOpts = {}): void {
  st.add(
    x + w / 2,
    y + d / 2,
    () => {
      const col = st.paint(o.col, st.col.cream);
      const n = o.rows ?? 4;
      const yy = y + d + 0.003;
      st.shadowR(x, y, w, d, { h: 0.7, a: 0.18, r: 0.02 });
      st.box(x, y, 0, w, d, h, col);
      for (let i = 0; i < n; i++) {
        const z0 = 0.05 + ((h - 0.08) * i) / n;
        const z1 = 0.05 + ((h - 0.08) * (i + 1)) / n - 0.04;
        st.fill(quadY(x + 0.04, x + w - 0.04, z0, z1, yy), dk(col, 0.18));
        spines(st, quadY, x + 0.05, x + w - 0.05, z0, z1, yy + 0.001, i * 17 + x * 3);
      }
      o.on?.(h);
    },
    o.bias ?? 0,
  );
}

/** An open wardrobe along the right wall: a rail of clothes, shelves of folded things, shoes. */
export function wardrobe(st: Stage, x: number, y: number, w: number, o: { h?: number; col?: Paint; bias?: number } = {}): void {
  st.add(
    x + w / 2,
    y + 0.28,
    () => {
      const C = st.col;
      const d = 0.56;
      const H = o.h ?? 1.2;
      const col = st.paint(o.col, C.cream);
      const cl = [C.coral, C.cream, C.blue, C.mustard, C.sage, C.ink, C.blush, C.blueDeep, C.terracotta, C.white, C.linenDeep, C.navy];
      st.shadowR(x, y, w, d, { h: 0.9, a: 0.18, r: 0.02 });
      st.box(x, y, 0, w, 0.05, H, dk(col, 0.05));
      st.box(x, y, 0, 0.05, d, H, col);
      st.box(x, y, 0, w, d, 0.07, col);
      const sx = x + w * 0.66;
      st.box(sx, y + 0.05, 0.07, 0.04, d - 0.05, H - 0.07, col);
      st.line([x + 0.06, y + d * 0.55, H - 0.2], [sx, y + d * 0.55, H - 0.2], C.graphite, st.lw(1.6));
      let a = x + 0.1;
      let i = 0;
      while (a < sx - 0.1) {
        const len = 0.42 + hsh(i * 2.3 + x) * 0.42;
        st.rbox(a, y + 0.14, H - 0.24 - len, 0.075, d - 0.24, len, 0.025, cl[(i * 5 + Math.floor(x)) % cl.length]);
        a += 0.105;
        i++;
      }
      for (let j = 0; j < 3; j++) {
        const z = 0.07 + ((H - 0.12) * (j + 1)) / 4;
        st.box(sx + 0.04, y + 0.05, z, x + w - 0.05 - sx - 0.04, d - 0.07, 0.03, col);
        for (let q = 0; q < 2; q++) for (let r = 0; r < 2 + (j % 2); r++) st.rbox(sx + 0.08 + q * 0.2, y + 0.16, z + 0.03 + r * 0.05, 0.17, d - 0.3, 0.045, 0.02, cl[(j * 3 + q * 2 + r) % cl.length]);
      }
      for (let q = 0; q < 4; q++) st.rbox(x + 0.12 + q * 0.26, y + 0.24, 0.07, 0.16, 0.24, 0.06, 0.03, q % 2 ? C.walnut : C.ink);
      st.box(x + w - 0.05, y, 0, 0.05, d, H, col);
      st.box(x, y, H - 0.04, w, d, 0.04, col);
    },
    o.bias ?? 0,
  );
}

/** A woven basket with laundry. */
export function basket(st: Stage, x: number, y: number, r = 0.2, h = 0.34): void {
  st.add(x, y, () => {
    const C = st.col;
    st.shadowC(x, y, r, { h: 0.3, a: 0.16 });
    st.cone(x, y, 0, r * 0.82, r, h, C.oak, { topFill: C.cream });
    for (let i = 1; i < 4; i++) st.ring(x, y, (h * i) / 4, r * (0.82 + (0.18 * i) / 4), dk(C.oak, 0.14), st.lw(0.8), 0.8);
    st.sph(x, y, h + 0.02, r * 0.6, C.white);
    st.sph(x + 0.06, y + 0.04, h + 0.03, r * 0.42, C.blush);
  });
}

export function toyBlocks(st: Stage, x: number, y: number): void {
  st.add(x, y, () => {
    const C = st.col;
    st.shadowR(x, y, 0.4, 0.2, { h: 0.2, a: 0.14 });
    st.rbox(x, y, 0, 0.17, 0.17, 0.17, 0.03, C.coral);
    st.rbox(x + 0.2, y + 0.05, 0, 0.17, 0.17, 0.17, 0.03, C.mustard);
    st.rbox(x + 0.09, y + 0.02, 0.17, 0.17, 0.17, 0.17, 0.03, C.blue);
  });
}

export function teddy(st: Stage, x: number, y: number, z = 0): void {
  st.add(
    x,
    y,
    () => {
      const col = st.col.ochre;
      st.sph(x, y, z + 0.11, 0.11, col);
      st.sph(x, y, z + 0.27, 0.085, col);
      st.sph(x - 0.06, y + 0.03, z + 0.345, 0.03, col);
      st.sph(x + 0.06, y - 0.03, z + 0.345, 0.03, col);
      st.sph(x + 0.02, y + 0.05, z + 0.255, 0.035, lt(col, 0.4));
    },
    0.3,
  );
}

/** A play tent. */
export function teepee(st: Stage, x: number, y: number, r = 0.5): void {
  st.add(x, y, () => {
    const C = st.col;
    const c = st.c;
    const s = st.s;
    st.shadowC(x, y, r, { h: 0.6 });
    st.cone(x, y, 0, r, 0.02, 1.05, C.cream);
    const [ax, ay] = st.P(x, y, 1.05);
    const [bx, by, rx, ry] = st.K.ell(x, y, 0, r);
    c.beginPath();
    c.moveTo(ax, ay + 0.2 * s);
    c.lineTo(bx - rx * 0.12, by + ry * 0.98);
    c.lineTo(bx + rx * 0.42, by + ry * 0.86);
    c.closePath();
    c.fillStyle = dk(C.walnut, 0.3);
    c.fill();
    c.save();
    c.beginPath();
    c.moveTo(ax, ay);
    c.lineTo(bx - rx, by);
    c.ellipse(bx, by, rx, ry, 0, Math.PI, 0, true);
    c.closePath();
    c.clip();
    for (const t of [0.55, 0.7]) {
      c.beginPath();
      c.ellipse(bx, by - (1 - t) * 1.05 * s, rx * t, ry * t, 0, 0, Math.PI);
      c.strokeStyle = C.coralLight;
      c.lineWidth = st.lw(2.2);
      c.stroke();
    }
    c.restore();
    for (const dx of [-0.07, 0.07]) {
      c.beginPath();
      c.moveTo(ax + dx * s * 0.3, ay + 0.05 * s);
      c.lineTo(ax - dx * s * 1.3, ay - 0.13 * s);
      c.strokeStyle = C.walnut;
      c.lineWidth = st.lw(1.6);
      c.stroke();
    }
  });
}

/* ---------- bathroom ---------- */

/** A bath; full shows water, bubbles and steam. */
export function bath(st: Stage, x: number, y: number, w: number, d: number, o: { water?: boolean } = {}): void {
  st.add(x + w / 2, y + d / 2, () => {
    const C = st.col;
    st.shadowR(x, y, w, d, { h: 0.4, a: 0.18, r: 0.2 });
    st.rbox(x, y, 0, w, d, 0.44, 0.2, C.white, { n: 5 });
    const inner = rr(x + 0.09, y + 0.09, w - 0.18, d - 0.18, 0.15, 5).map((p) => [p[0], p[1], 0.442] as const);
    st.fill(inner, o.water ? C.water : '#E6EAEC');
    if (o.water) {
      for (const [a, b, r] of [
        [0.3, 0.3, 0.07],
        [0.42, 0.42, 0.055],
        [0.6, 0.3, 0.06],
        [1.1, 0.5, 0.05],
      ])
        st.sph(x + a, y + b, 0.46, r, C.white);
      steam(st, x + w * 0.6, y + d / 2, 0.6, 1.2);
    }
    st.pline([[x + w - 0.16, y + d / 2, 0.44], [x + w - 0.16, y + d / 2, 0.62], [x + w - 0.3, y + d / 2, 0.62]], C.chrome, st.lw(2));
  });
}

/** A towel hung over a bath's front edge, from x0 to x1 at the edge y = yy. */
export function bathTowel(st: Stage, x0: number, x1: number, yy: number, col?: Paint): void {
  st.add(
    (x0 + x1) / 2,
    yy,
    () => {
      const tc = st.paint(col, st.col.coralLight);
      st.fill([[x0, yy, 0.445], [x1, yy, 0.445], [x1, yy, 0.2], [x0, yy, 0.2]], tc);
      st.fill([[x0, yy - 0.345, 0.447], [x1, yy - 0.345, 0.447], [x1, yy, 0.447], [x0, yy, 0.447]], lt(tc, 0.3));
    },
    1,
  );
}

/** A vanity unit against the right wall: basin, tap, a cup of toothbrushes and a pot of herbs. */
export function vanity(st: Stage, x: number, y: number, w: number, o: { col?: Paint } = {}): void {
  st.add(x + w / 2, y + 0.24, () => {
    const C = st.col;
    const d = 0.46;
    st.shadowR(x, y, w, d, { h: 0.4, a: 0.16, r: 0.02 });
    st.box(x, y, 0.12, w, d, 0.3, st.paint(o.col, C.walnut));
    st.line([x + w / 2, y + d + 0.003, 0.14], [x + w / 2, y + d + 0.003, 0.4], dk(C.walnut, 0.2), st.lw(1));
    st.rbox(x - 0.02, y, 0.42, w + 0.04, d + 0.03, 0.04, 0.015, C.stone);
    st.cone(x + w * 0.5, y + 0.24, 0.46, 0.1, 0.17, 0.07, C.white, { topFill: '#E3E8EA' });
    st.pline([[x + w * 0.5, y + 0.05, 0.46], [x + w * 0.5, y + 0.05, 0.6], [x + w * 0.5, y + 0.15, 0.6]], C.chrome, st.lw(2));
    st.cyl(x + 0.12, y + 0.14, 0.46, 0.035, 0.07, C.blush);
    st.line([x + 0.12, y + 0.14, 0.53], [x + 0.14, y + 0.14, 0.63], C.coral, st.lw(1.2));
    st.line([x + 0.12, y + 0.14, 0.53], [x + 0.1, y + 0.14, 0.62], C.blue, st.lw(1.2));
    plant(st, x + w - 0.12, y + 0.14, 'herb', { z: 0.46, now: true });
  });
}

/** A toilet, its cistern against the left wall ('W') or the right wall ('N'). */
export function loo(st: Stage, x: number, y: number, side: 'W' | 'N' = 'W'): void {
  st.add(x, y, () => {
    const C = st.col;
    st.shadowC(x, y, 0.2, { h: 0.3, a: 0.16 });
    if (side === 'W') st.rbox(x - 0.36, y - 0.18, 0, 0.16, 0.36, 0.48, 0.04, C.white);
    else st.rbox(x - 0.18, y - 0.36, 0, 0.36, 0.16, 0.48, 0.04, C.white);
    st.prism(circ(x, y, 0.17, 16), 0, 0.26, C.white);
    st.prism(circ(x, y, 0.185, 16), 0.26, 0.03, C.white);
  });
}

/** A walk-in shower: tray, glass, a rain head; running shows water and steam. */
export function shower(st: Stage, x: number, y: number, w: number, d: number, o: { on?: boolean } = {}): void {
  st.add(x + w / 2, y + d / 2, () => {
    const C = st.col;
    const c = st.c;
    st.rbox(x, y, 0, w, d, 0.04, 0.04, C.stone, { flat: true });
    st.disc(x + w / 2, y + d / 2, 0.042, 0.04, C.greyDeep);
    st.pline([[x + 0.08, y + 0.05, 0.04], [x + 0.08, y + 0.05, 1.3], [x + 0.4, y + 0.3, 1.3]], C.chrome, st.lw(2));
    st.disc(x + 0.4, y + 0.3, 1.29, 0.11, C.chrome);
    if (o.on) {
      for (let i = 0; i < 7; i++) st.line([x + 0.33 + (i % 3) * 0.07, y + 0.24 + ((i * 2) % 3) * 0.06, 1.25], [x + 0.33 + (i % 3) * 0.07, y + 0.24 + ((i * 2) % 3) * 0.06, 0.1 + (i % 2) * 0.2], '#9CC6DA', st.lw(1), 0.7);
      steam(st, x + w / 2, y + d / 2, 1.0, 1.5, 4);
    }
    const g: [number, number, number][] = [
      [x + w, y, 0.04],
      [x + w, y + d, 0.04],
      [x + w, y + d, 1.15],
      [x + w, y, 1.15],
    ];
    st.fill(g, 'rgba(200,225,235,.34)', false);
    c.strokeStyle = 'rgba(255,255,255,.9)';
    c.lineWidth = st.lw(1.2);
    c.stroke(st.path(g));
    st.line([x + w, y + d * 0.25, 0.3], [x + w, y + d * 0.6, 1.0], '#FFFFFF', st.lw(3), 0.35);
  });
}

/** A washing machine, door toward us; running lights the drum and its button. */
export function washer(st: Stage, x: number, y: number, o: { running?: boolean; on?: On } = {}): void {
  st.add(x + 0.3, y + 0.3, () => {
    const C = st.col;
    st.shadowR(x, y, 0.6, 0.6, { h: 0.5, a: 0.18, r: 0.03 });
    st.rbox(x, y, 0, 0.6, 0.6, 0.66, 0.03, C.white);
    const yy = y + 0.603;
    st.fill(circY(x + 0.3, 0.3, 0.2, yy), C.chrome);
    st.fill(circY(x + 0.3, 0.3, 0.15, yy + 0.001), o.running ? '#8FB9D6' : '#4A5560');
    if (o.running) st.fill(circY(x + 0.27, 0.27, 0.08, yy + 0.002), C.white);
    st.fill(quadY(x + 0.05, x + 0.55, 0.56, 0.62, yy), C.grey);
    st.fill(circY(x + 0.46, 0.59, 0.022, yy + 0.001), o.running ? C.coral : C.greyDeep);
    o.on?.(0.66);
  });
}

/** A drying rack with washing on it. */
export function dryingRack(st: Stage, x: number, y: number): void {
  st.add(x + 0.5, y + 0.3, () => {
    const C = st.col;
    const cols = [C.coralLight, C.white, C.blue, C.mustard, C.sage];
    st.shadowR(x, y, 1.0, 0.6, { h: 0.2, a: 0.12 });
    for (const xx of [x, x + 1.0]) {
      st.line([xx, y, 0], [xx, y + 0.3, 0.72], C.chrome, st.lw(1.5));
      st.line([xx, y + 0.6, 0], [xx, y + 0.3, 0.72], C.chrome, st.lw(1.5));
    }
    for (let i = 0; i < 5; i++) {
      const yy = y + 0.1 + i * 0.1;
      const z = 0.72 - Math.abs(i - 2) * 0.05;
      st.line([x, yy, z], [x + 1.0, yy, z], C.chrome, st.lw(1));
      if (i % 2 === 0 || i === 3) st.fill(quadY(x + 0.1 + i * 0.12, x + 0.36 + i * 0.12, z - 0.3, z, yy + 0.002), cols[i]);
    }
  });
}

/* ---------- stairs ---------- */

/** Stairs rising toward the back (y), n steps, with a rail on the right. */
export function stairs(st: Stage, x: number, y: number, w: number, d: number, o: { n?: number; step?: number; tread?: Paint; bias?: number } = {}): void {
  st.add(
    x + w / 2,
    y + d - 0.1,
    () => {
      const C = st.col;
      const n = o.n ?? 6;
      const st0 = o.step ?? 0.125;
      st.shadowR(x, y, w, d, { h: 0.5, a: 0.16, r: 0.02 });
      for (let i = 0; i < n; i++) {
        const hh = (n - i) * st0;
        st.box(x, y + (i * d) / n, 0, w, d / n, hh, C.cream, { flat: true });
        st.box(x - 0.01, y + (i * d) / n, hh, w + 0.02, d / n + 0.015, 0.025, st.paint(o.tread, C.oak));
      }
      const pts: [number, number, number][] = [];
      for (let i = 0; i <= n; i += 2) {
        const yy = y + (Math.min(i, n - 0.2) * d) / n + 0.05;
        const hh = (n - Math.min(i, n - 1)) * st0;
        st.line([x + w, yy, hh], [x + w, yy, hh + 0.42], C.graphite, st.lw(1.3));
        pts.push([x + w, yy, hh + 0.42]);
      }
      st.pline(pts, C.walnut, st.lw(2.2));
    },
    o.bias ?? 0,
  );
}

/** A stairwell going down: an opening with steps falling away into it and a rail on its two open sides. */
export function stairwell(st: Stage, x: number, y: number, w: number, d: number, o: { steps?: number } = {}): void {
  st.add(
    x - 0.06,
    y - 0.06,
    () => {
      const C = st.col;
      const n = o.steps ?? 5;
      st.fill([[x, y, 0.003], [x + w, y, 0.003], [x + w, y + d, 0.003], [x, y + d, 0.003]], '#6B5A4A');
      const step = d / n;
      for (let i = 0; i < n; i++)
        st.fill(
          [
            [x, y + i * step, 0.004],
            [x + w, y + i * step, 0.004],
            [x + w, y + i * step + step * 0.76, 0.004],
            [x, y + i * step + step * 0.76, 0.004],
          ],
          mix(C.oak, '#4A3B2E', 0.15 + i * 0.16),
        );
      const pts: [number, number][] = [
        [x + w, y],
        [x + w, y + d],
        [x, y + d],
      ];
      pts.forEach(([a, b]) => st.line([a, b, 0], [a, b, 0.46], C.graphite, 1.3));
      st.pline(
        pts.map(([a, b]) => [a, b, 0.46] as const),
        C.walnut,
        2.2,
      );
    },
    -30,
  );
}

