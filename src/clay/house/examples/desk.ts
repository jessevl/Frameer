/**
 * @file desk.ts
 * @description Example close-up in code: a home desk, the picture a tasks app shows. The window shows the time of day, the board a card per task due (the first in coral), the tray a sheet per task done, the lamp is on or off, a parcel waits on the sill. Wall pieces (window, shelf, clock, board) hang in the air behind a desk that floats over its shadow. It keeps the reuse of the engine for another app's picture proven until that app adopts it (Hearth D-3).
 * Ported from hearth-concept/clay2/scenes.js (CLOSEUPS.desk).
 * Used by: house.test.ts, scripts/house-pictures.ts.
 */
import { WARM, dk, lt } from '../colors';
import type { CloseupScene } from '../closeup';
import { steam } from '../objects/effects';
import { plant } from '../objects/plants';
import { circY, clockY, quadY, shelfY, windowY } from '../objects/wall';
import { rr, type Stage } from '../stage';

export interface DeskModel {
  /** Tasks due: up to four cards on the board. */
  due?: number;
  /** Tasks done: up to three sheets in the tray. */
  done?: number;
  lamp?: boolean;
  parcel?: boolean;
}

/** The desk close-up for a model. */
export function deskScene(m: DeskModel = {}): CloseupScene {
  const due = m.due ?? 4;
  const done = m.done ?? 2;
  const lampOn = !!m.lamp;
  return {
    extent: { x0: -0.5, y0: 0, x1: 3.3, y1: 2.35, zt: 2.5 },
    draw: (st: Stage) => {
      const C = st.col;
      const T = 0.74;
      const lw = (k: number) => Math.max(0.7, (k * st.s) / 40);
      const dark = st.env.night || st.env.dusk;
      // Behind: the window with a curtain, its sill and a parcel, a shelf with a trailing plant, the clock and the board.
      windowY(st, 0.75, 2.05, 0.98, 2.2, { curtain: 'linen', panes: 2, moon: true });
      if (m.parcel !== false)
        st.add(
          1.75,
          0.05,
          () => {
            st.rbox(1.6, 0.03, 0.9, 0.32, 0.22, 0.2, 0.03, C.cream);
            st.line([1.76, 0.255, 0.9], [1.76, 0.255, 1.1], C.coral, lw(1.6));
            st.line([1.6, 0.14, 1.102], [1.92, 0.14, 1.102], C.coral, lw(1.6));
            st.line([1.76, 0.03, 1.102], [1.76, 0.25, 1.102], C.coral, lw(1.6));
          },
          1,
        );
      shelfY(st, -0.45, 0.45, 2.0, { on: (z) => plant(st, 0.0, 0.11, 'trail', { z, now: true, k: 1.7, pot: 'cream' }) });
      clockY(st, 2.86, 2.2, 0.27);
      st.add(
        2.75,
        0.02,
        () => {
          st.fill(quadY(2.38, 3.3, 1.0, 1.78, 0.012), C.linen);
          st.fill(quadY(2.41, 3.27, 1.03, 1.75, 0.014), lt(C.linen, 0.25));
          const slots = [
            [2.48, 1.44],
            [2.88, 1.48],
            [2.5, 1.09],
            [2.9, 1.11],
          ];
          slots.slice(0, Math.min(4, due)).forEach(([x, z], i) => {
            st.fill(quadY(x, x + 0.3, z, z + 0.24, 0.016), C.white);
            for (let k = 0; k < 2; k++) st.line([x + 0.05, 0.017, z + 0.09 + k * 0.05], [x + 0.24 - k * 0.07, 0.017, z + 0.09 + k * 0.05], C.greyDeep, lw(0.9));
            st.fill(circY(x + 0.15, z + 0.2, 0.024, 0.018), i === 0 ? C.coral : C.graphite);
          });
        },
        -3,
      );
      // The desk: one thick top, no legs, floating over its shadow.
      st.shadow(rr(0.2, 0.55, 3.2, 2.0, 0.12), { h: 1.4, a: 0.24, blur: 0.3 });
      st.add(1.6, 1.3, () => st.rbox(0, 0.25, T - 0.14, 3.25, 2.05, 0.14, 0.05, C.oak), -20);
      // On it, back to front: a speaker, a laptop, a mug, an open notebook, the tray of done tasks, the lamp.
      st.add(0.75, 0.6, () => {
        st.shadowC(0.78, 0.62, 0.22, { h: 0.6, a: 0.18 });
        st.cyl(0.78, 0.6, T, 0.21, 0.52, C.graphite, { topFill: dk(C.graphite, 0.3) });
        st.cyl(0.78, 0.6, T + 0.52, 0.14, 0.12, C.greyDeep);
      });
      st.add(1.6, 1.05, () => {
        const x = 1.12;
        const y = 0.82;
        const w = 1.02;
        const d = 0.68;
        st.shadowR(x, y, w, d, { h: 0.1, a: 0.14 });
        st.rbox(x, y, T, w, d, 0.04, 0.03, C.steel);
        st.fill(rr(x + 0.09, y + 0.2, w - 0.18, d - 0.32, 0.02).map((p) => [p[0], p[1], T + 0.041] as const), dk(C.steel, 0.1));
        st.fill([[x, y + 0.02, T + 0.045], [x + w, y + 0.02, T + 0.045], [x + w, y - 0.07, T + 0.69], [x, y - 0.07, T + 0.69]], C.graphite);
        const p = st.fill([[x + 0.05, y + 0.015, T + 0.09], [x + w - 0.05, y + 0.015, T + 0.09], [x + w - 0.05, y - 0.06, T + 0.65], [x + 0.05, y - 0.06, T + 0.65]], C.cream);
        if (dark) {
          st.emit(p, '#FFFFFF');
          st.light(x + w / 2, y + 0.5, T, { r: 1.1, col: [205, 218, 255], a: 0.35, clip: null });
        }
      });
      st.add(0.5, 1.4, () => {
        st.shadowC(0.5, 1.4, 0.22, { h: 0.45, a: 0.2 });
        st.cyl(0.5, 1.4, T, 0.2, 0.36, C.white, { topFill: dk(C.walnut, 0.35) });
        st.ring(0.7, 1.4, T + 0.18, 0.08, C.white, lw(2.6));
        steam(st, 0.5, 1.4, T + 0.42, 0.55, 3);
      });
      st.add(1.3, 1.95, () => {
        const x = 0.95;
        const y = 1.62;
        const w = 1.08;
        const d = 0.66;
        st.shadowR(x, y, w, d, { h: 0.06, a: 0.12 });
        st.rbox(x, y, T, w / 2, d, 0.035, 0.01, C.white);
        st.rbox(x + w / 2, y, T, w / 2, d, 0.035, 0.01, C.white);
        st.line([x + w / 2, y, T + 0.036], [x + w / 2, y + d, T + 0.036], C.grey, lw(1));
        for (let i = 0; i < 4; i++) {
          st.line([x + 0.08, y + 0.13 + i * 0.11, T + 0.037], [x + w / 2 - 0.08, y + 0.13 + i * 0.11, T + 0.037], C.grey, lw(1));
          if (i < 3) st.line([x + w / 2 + 0.08, y + 0.13 + i * 0.11, T + 0.037], [x + w - 0.1 - i * 0.07, y + 0.13 + i * 0.11, T + 0.037], C.grey, lw(1));
        }
        st.line([x + 0.46, y - 0.07, T + 0.039], [x + 0.66, y + d + 0.09, T + 0.039], C.coral, lw(2.2));
        st.line([x + w / 2 + 0.12, y + 0.46, T + 0.06], [x + w - 0.08, y + 0.55, T + 0.06], C.ink, lw(3.4));
      });
      st.add(2.4, 2.05, () => {
        const x = 2.12;
        const y = 1.78;
        const w = 0.68;
        const d = 0.48;
        st.shadowR(x, y, w, d, { h: 0.2, a: 0.16 });
        st.rbox(x, y, T, w, d, 0.08, 0.03, C.greyDeep);
        st.fill(rr(x + 0.05, y + 0.05, w - 0.1, d - 0.1, 0.02).map((p) => [p[0], p[1], T + 0.03] as const), dk(C.greyDeep, 0.15));
        for (let i = 0; i < Math.min(3, done); i++) st.rbox(x + 0.08, y + 0.08, T + 0.035 + i * 0.014, w - 0.16, d - 0.16, 0.012, 0.01, C.white);
        if (done) st.pline([[x + 0.24, y + 0.26, T + 0.09], [x + 0.31, y + 0.33, T + 0.09], [x + 0.46, y + 0.15, T + 0.09]], C.coral, lw(2.4));
      });
      // The lamp: a round foot at the front right, a pole, and a short arm back over the desk.
      st.add(
        2.9,
        1.7,
        () => {
          const fx = 2.88;
          const fy = 1.45;
          const hx = 2.55;
          const hy = 0.88;
          const top = T + 1.0;
          st.shadowC(fx, fy, 0.26, { h: 0.2, a: 0.2 });
          st.cyl(fx, fy, T, 0.24, 0.045, C.graphite);
          st.line([fx, fy, T + 0.045], [fx, fy, top], C.graphite, lw(2.8));
          st.line([fx, fy, top], [hx, hy, top], C.graphite, lw(2.8));
          st.cone(hx, hy, top - 0.36, 0.3, 0.1, 0.32, lampOn ? lt(C.mustard, 0.5) : C.greyDeep, { topFill: C.graphite });
          if (lampOn) {
            st.disc(hx, hy, top - 0.36, 0.27, '#FFF3E0');
            st.halo(hx, hy, top - 0.38, 0.45, WARM, 0.45);
            st.light(hx, hy, top - 0.4, { r: 1.1, col: WARM, a: 0.7, clip: null });
            st.light(hx - 0.3, hy + 0.5, 0, { r: 1.5, col: WARM, a: 0.75, clip: null });
          }
        },
        2,
      );
      return null;
    },
  };
}
