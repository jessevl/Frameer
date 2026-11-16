/**
 * @file utility.ts
 * @description The plant room of the house pictures: a battery pack with a column of five lights for its charge, an inverter, the hot water tank with a coral bar for how hot it is, and the ventilation box whose three lights and moving air show its level (0 low, 1 medium, 2 high), a panel radiator and a wall-hung boiler.
 * Ported from hearth-concept/clay2/things-b.js (the plant room).
 * Used by: items.ts.
 */
import { lt } from '../colors';
import type { Point3 } from '../../clay';
import { TAU, type Stage } from '../stage';
import { air } from './effects';
import { circY, quadY } from './wall';

const GREEN = '#63BE84';

function leds(st: Stage, a0: number, z0: number, at: number, n: number, onN: number, col = GREEN): void {
  for (let i = 0; i < n; i++) {
    const q: Point3[] = quadY(a0, a0 + 0.07, z0 + i * 0.075, z0 + i * 0.075 + 0.05, at);
    const on = i < onN;
    const p = st.fill(q, on ? col : '#C9C5BE');
    if (on) st.emit(p, '#FFFFFF');
  }
}

/** A battery pack, front toward us; `soc` (0 to 1) lights one to five lights. */
export function battery(st: Stage, x: number, y: number, soc: number): void {
  st.add(x + 0.26, y + 0.24, () => {
    const C = st.col;
    const w = 0.52;
    const d = 0.48;
    const h = 0.98;
    const yy = y + d + 0.004;
    st.shadowR(x, y, w, d, { h: 0.7, a: 0.2, r: 0.03 });
    st.rbox(x, y, 0, w, d, h, 0.04, C.cream);
    st.fill(quadY(x + 0.06, x + w - 0.06, 0.1, h - 0.1, yy), C.linen);
    st.fill(quadY(x + 0.1, x + 0.24, 0.5, 0.92, yy + 0.001), C.ink);
    leds(st, x + 0.135, 0.53, yy + 0.002, 5, Math.max(1, Math.round(soc * 5)));
    st.line([x + 0.3, yy + 0.001, 0.2], [x + w - 0.1, yy + 0.001, 0.2], C.greyDeep, st.lw(1.5));
    if (st.env.night) st.halo(x + 0.17, yy, 0.7, 0.2, [100, 190, 130], 0.3);
  });
}

export function inverter(st: Stage, x: number, y: number): void {
  st.add(x + 0.25, y + 0.16, () => {
    const col = '#5B8CC9';
    const yy = y + 0.323;
    st.shadowR(x, y, 0.5, 0.32, { h: 0.4, a: 0.18, r: 0.03 });
    st.rbox(x, y, 0, 0.5, 0.32, 0.56, 0.03, col);
    st.fill(quadY(x + 0.05, x + 0.45, 0.4, 0.5, yy), lt(col, 0.75));
    st.fill(quadY(x + 0.3, x + 0.42, 0.2, 0.32, yy), st.col.ink);
    const p = st.fill(circY(x + 0.12, 0.26, 0.022, yy), GREEN);
    st.emit(p, '#FFFFFF');
  });
}

/** The hot water tank; the coral bar shows how hot it is (0 to 1). */
export function tank(st: Stage, x: number, y: number, frac = 0.8): void {
  st.add(x, y, () => {
    const C = st.col;
    const c = st.c;
    const r = 0.3;
    const h = 1.08;
    st.shadowC(x, y, r, { h: 0.9, a: 0.22 });
    st.cyl(x, y, 0, r * 0.9, 0.05, C.graphite);
    st.cyl(x, y, 0.05, r, h, C.white);
    st.cone(x, y, h + 0.05, r, 0.12, 0.1, C.white);
    for (const z of [0.3, 0.8]) st.ring(x, y, z, r, C.grey, st.lw(1), 0.9);
    const [a, b] = st.P(x + r * 0.5, y + r * 0.87, 0.24);
    const H = 0.6 * st.s;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(a, b);
    c.lineTo(a, b - H);
    c.strokeStyle = '#D9D4CC';
    c.lineWidth = st.lw(3.4);
    c.stroke();
    c.beginPath();
    c.moveTo(a, b);
    c.lineTo(a, b - H * frac);
    c.strokeStyle = C.coral;
    c.stroke();
    st.cyl(x - 0.1, y, h + 0.14, 0.03, 0.2, C.coralLight);
    st.cyl(x + 0.1, y, h + 0.14, 0.03, 0.2, C.blue);
  });
}

/** The ventilation box: level 0 low, 1 medium, 2 high. */
export function ventBox(st: Stage, x: number, y: number, level = 0): void {
  st.add(x + 0.31, y + 0.23, () => {
    const C = st.col;
    const w = 0.62;
    const d = 0.46;
    const h = 0.46;
    const yy = y + d + 0.004;
    st.shadowR(x, y, w, d, { h: 0.4, a: 0.18, r: 0.03 });
    st.rbox(x, y, 0.04, w, d, h, 0.04, C.white);
    st.fill(circY(x + 0.2, 0.27, 0.14, yy), C.grey);
    st.fill(circY(x + 0.2, 0.27, 0.11, yy + 0.001), C.graphite);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU + 0.4;
      st.line([x + 0.2, yy + 0.002, 0.27], [x + 0.2 + Math.cos(a) * 0.1, yy + 0.002, 0.27 + Math.sin(a) * 0.1], C.chrome, st.lw(2.2));
    }
    for (let i = 0; i < 3; i++) {
      const p = st.fill(circY(x + 0.42 + i * 0.065, 0.4, 0.02, yy), i <= level ? C.coral : C.grey);
      if (i <= level) st.emit(p, '#FFFFFF');
    }
    st.cyl(x + 0.18, y + 0.2, h + 0.04, 0.085, 0.2, C.steel, { topFill: C.graphite });
    st.cyl(x + 0.44, y + 0.2, h + 0.04, 0.085, 0.2, C.steel, { topFill: C.graphite });
    if (level > 0) {
      air(st, x + 0.18, y + 0.2, h + 0.36, 0.8, 1);
      if (level > 1) air(st, x + 0.44, y + 0.2, h + 0.4, 0.9, 1);
    }
  });
}

/** A panel radiator standing against a wall, w long along x, its fins showing; `warm` (0 to 1) blushes it. */
export function radiator(st: Stage, x: number, y: number, w = 0.9, warm = 0): void {
  st.add(x + w / 2, y + 0.06, () => {
    const C = st.col;
    const h = 0.42;
    const z = 0.08;
    const col = warm > 0 ? lt(C.coralLight, 0.6 - warm * 0.35) : C.white;
    st.shadowR(x, y, w, 0.1, { h: 0.3, a: 0.14, r: 0.02 });
    st.box(x + 0.04, y + 0.02, 0, 0.03, 0.03, z, C.steel);
    st.box(x + w - 0.07, y + 0.02, 0, 0.03, 0.03, z, C.steel);
    st.rbox(x, y, z, w, 0.1, h, 0.02, col, { soft: 0.15 });
    const yy = y + 0.101;
    for (let xx = x + 0.06; xx < x + w - 0.03; xx += 0.06) st.line([xx, yy, z + 0.04], [xx, yy, z + h - 0.04], '#D9D4CC', Math.max(0.6, st.s / 60), 0.7);
  });
}

/** A boiler hung on a wall at height z: a white box with a small display, pipes below it. */
export function boiler(st: Stage, x: number, y: number, z = 0.6, on = false): void {
  st.add(x + 0.22, y + 0.15, () => {
    const C = st.col;
    const yy = y + 0.301;
    for (const px of [x + 0.1, x + 0.18, x + 0.26, x + 0.34]) st.box(px, y + 0.12, 0, 0.025, 0.025, z, C.steel);
    st.rbox(x, y, z, 0.44, 0.3, 0.62, 0.04, C.white, { soft: 0.2 });
    st.fill(quadY(x + 0.12, x + 0.32, z + 0.38, z + 0.48, yy), C.ink);
    const p = st.fill(quadY(x + 0.15, x + 0.24, z + 0.41, z + 0.45, yy + 0.001), on ? C.coral : '#7F9373');
    if (on) st.emit(p, '#FFFFFF');
  });
}
