/**
 * @file yard.ts
 * @description Example close-up in code: a container yard, the picture an app manager shows. A stack of containers per app on a paved slab with its bay marked, a status light and a cloud where one needs a look, an update waiting on the van at the gate, the crane and the office (its window lit at night), a fence along the back. It keeps the reuse of the engine for another app's picture proven until that app adopts it (Hearth D-3).
 * Ported from hearth-concept/clay2/scenes.js (CLOSEUPS.yard).
 * Used by: house.test.ts, scripts/house-pictures.ts.
 */
import { WARM, dk, lt, type Paint } from '../colors';
import type { CloseupScene } from '../closeup';
import { CONTAINER, container } from '../objects/outdoor';
import { circY } from '../objects/wall';
import { rr, type Stage } from '../stage';

/** One app in the yard: its colour, how many containers, where its bay is, and whether it needs a look. */
export interface YardApp {
  name: string;
  col: Paint;
  n: number;
  at: readonly [number, number];
  state?: 'ok' | 'warn';
}

export interface YardModel {
  apps?: readonly YardApp[];
  /** An update waiting at the gate (on by default), and its colour. */
  crate?: boolean;
  crateCol?: Paint;
}

const APPS: readonly YardApp[] = [
  { name: 'a', col: 'terracotta', n: 2, at: [0.45, 0.55] },
  { name: 'b', col: 'blue', n: 3, at: [2.05, 0.5] },
  { name: 'c', col: 'lilac', n: 2, at: [3.65, 0.55] },
  { name: 'd', col: 'coral', n: 2, at: [1.35, 2.15], state: 'warn' },
  { name: 'e', col: 'mustard', n: 1, at: [3.05, 2.35] },
];

/** The yard close-up for a model. */
export function yardScene(m: YardModel = {}): CloseupScene {
  const apps = m.apps ?? APPS;
  return {
    extent: { x0: 0, y0: 0, x1: 6.4, y1: 4.2, zt: 1.15 },
    draw: (st: Stage) => {
      const C = st.col;
      const lw = (k: number) => Math.max(0.6, (k * st.s) / 50);
      const { L, D: Dp, H } = CONTAINER;
      // The slab, its seams and the bay markings.
      const base = rr(0, 0, 6.4, 4.2, 0.18, 6);
      st.prism(base, -0.22, 0.22, dk(C.paver, 0.12), { top: lt(C.paver, 0.35), edge: 0.4 });
      const dash = (pts: [number, number, number][]) => {
        st.c.save();
        st.c.setLineDash([lw(3), lw(4)]);
        st.pline(pts, dk(C.paver, 0.12), lw(1.1), 0.9);
        st.c.restore();
      };
      const bay = (x0: number, y0: number, x1: number, y1: number) =>
        dash([
          [x0, y0, 0.002],
          [x1, y0, 0.002],
          [x1, y1, 0.002],
          [x0, y1, 0.002],
          [x0, y0, 0.002],
        ]);
      for (const a of apps) bay(a.at[0] - 0.12, a.at[1] - 0.12, a.at[0] + L + 0.12, a.at[1] + Dp + 0.32);
      bay(4.7, 1.55, 5.95, 2.25);
      // The fence along the two back edges.
      st.add(
        0,
        0,
        () => {
          const posts: [number, number][] = [];
          for (let x = 0.15; x <= 6.3; x += 0.62) posts.push([x, 0.08]);
          for (let y = 0.7; y <= 4.1; y += 0.62) posts.push([0.08, y]);
          for (const [x, y] of posts) st.line([x, y, 0], [x, y, 0.42], C.greyDeep, lw(1.6));
          st.pline([[6.3, 0.08, 0.4], [0.08, 0.08, 0.4], [0.08, 4.1, 0.4]], C.greyDeep, lw(1.4));
          st.pline([[6.3, 0.08, 0.2], [0.08, 0.08, 0.2], [0.08, 4.1, 0.2]], C.grey, lw(1.1));
        },
        -30,
      );
      for (const a of apps) {
        const [x, y] = a.at;
        st.add(x + L / 2, y + Dp / 2, () => {
          st.shadowR(x, y, L, Dp, { h: H * Math.min(2, a.n), a: 0.2 });
          const stack = Math.min(2, a.n);
          for (let i = 0; i < stack; i++) container(st, x, y, i * H, a.col, { label: i === stack - 1 });
          if (a.n > 2) container(st, x + 0.05, y + Dp + 0.08, 0, a.col, { label: true });
          if (a.state === 'warn') {
            const lz = stack * H + 0.12;
            const cx = x + 0.25;
            const cy = y + 0.25;
            st.cyl(cx, cy, stack * H, 0.03, 0.08, C.graphite);
            st.sph(cx, cy, lz, 0.1, '#F0B450');
            st.halo(cx, cy, lz, 0.45, [240, 180, 80], 0.7);
            for (const [dx, dy, dz, r] of [
              [-0.2, 0, 0.8, 0.22],
              [0.1, -0.06, 0.9, 0.27],
              [0.34, 0.07, 0.79, 0.19],
            ])
              st.sph(cx + dx, cy + dy, lz + dz, r, C.white);
          }
        });
      }
      // The crane in the back right, its jib over the yard.
      st.add(5.6, 0.7, () => {
        const x = 5.55;
        const y = 0.65;
        const top = 2.7;
        st.shadowR(x - 0.25, y - 0.25, 0.5, 0.5, { h: 2, a: 0.18 });
        st.rbox(x - 0.28, y - 0.28, 0, 0.56, 0.56, 0.08, 0.04, C.grey);
        st.box(x - 0.11, y - 0.11, 0.08, 0.22, 0.22, top - 0.08, C.greyDeep);
        for (let z = 0.3; z < top; z += 0.24) {
          st.line([x + 0.112, y - 0.11, z], [x + 0.112, y + 0.11, z + 0.2], dk(C.greyDeep, 0.2), lw(0.8));
          st.line([x - 0.11, y + 0.112, z], [x + 0.11, y + 0.112, z + 0.2], dk(C.greyDeep, 0.2), lw(0.8));
        }
        st.rbox(x - 0.16, y - 0.16, top, 0.32, 0.32, 0.26, 0.03, C.white);
        st.box(x - 2.4, y - 0.05, top + 0.18, 3.0, 0.1, 0.07, C.greyDeep);
        st.rbox(x + 0.35, y - 0.12, top + 0.02, 0.32, 0.24, 0.2, 0.03, C.grey);
        st.line([x - 1.95, y, top + 0.18], [x - 1.95, y, top - 0.75], C.ink, lw(1.2));
        st.box(x - 2.01, y - 0.05, top - 0.85, 0.12, 0.1, 0.1, C.mustard);
      });
      // The office in the front right, its window lit at night.
      st.add(5.3, 3.3, () => {
        const x = 4.8;
        const y = 2.85;
        const w = 1.05;
        const d = 0.9;
        const h = 0.78;
        st.shadowR(x, y, w, d, { h, a: 0.2 });
        st.rbox(x, y, 0, w, d, h, 0.04, C.white);
        st.rbox(x - 0.06, y - 0.06, h, w + 0.12, d + 0.12, 0.06, 0.04, C.grey);
        const fy = y + d + 0.003;
        st.fill([[x + 0.12, fy, 0.02], [x + 0.36, fy, 0.02], [x + 0.36, fy, 0.5], [x + 0.12, fy, 0.5]], C.sage);
        const win = st.fill([[x + 0.5, fy, 0.3], [x + 0.92, fy, 0.3], [x + 0.92, fy, 0.6], [x + 0.5, fy, 0.6]], st.env.night ? '#FFE9C8' : C.sky);
        if (st.env.night) {
          st.emit(win, '#FFFFFF');
          st.light(x + 0.7, fy + 0.5, 0, { r: 1.2, col: WARM, a: 0.8, clip: null });
        }
      });
      // The gate post and the van bringing an update.
      st.add(1.6, 3.5, () => {
        st.box(1.55, 3.45, 0, 0.1, 0.1, 0.62, C.greyDeep);
        st.rbox(1.52, 3.42, 0.62, 0.16, 0.16, 0.05, 0.02, C.grey);
      });
      if (m.crate !== false)
        st.add(0.75, 3.55, () => {
          const x = 0.2;
          const y = 3.3;
          const crate = st.paint(m.crateCol, C.lilac);
          st.shadowR(x, y, 1.15, 0.6, { h: 0.5, a: 0.24 });
          for (const [wx, wy] of [
            [x + 0.25, y + 0.6],
            [x + 0.9, y + 0.6],
          ])
            st.fill(circY(wx, 0.12, 0.12, wy), C.ink);
          st.rbox(x, y, 0.1, 0.72, 0.6, 0.12, 0.02, C.grey);
          st.rbox(x + 0.72, y, 0.1, 0.42, 0.6, 0.48, 0.06, C.white);
          st.fill([[x + 1.143, y + 0.08, 0.36], [x + 1.143, y + 0.52, 0.36], [x + 1.143, y + 0.52, 0.52], [x + 1.143, y + 0.08, 0.52]], '#5A6672');
          st.rbox(x + 0.06, y + 0.08, 0.22, 0.58, 0.44, 0.34, 0.03, crate, { soft: 0.3 });
          for (let i = 1; i < 6; i++) st.line([x + 0.06 + i * 0.097, y + 0.523, 0.24], [x + 0.06 + i * 0.097, y + 0.523, 0.54], dk(crate, 0.12), lw(0.9));
        });
      if (st.env.night)
        for (const [x, y] of [
          [0.1, 0.1],
          [6.3, 4.1],
        ])
          st.light(x + 0.6, y + 0.4, 0, { r: 1.8, col: [255, 214, 170], a: 0.35, clip: null });
      return base;
    },
  };
}
