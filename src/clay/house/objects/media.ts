/**
 * @file media.ts
 * @description Screens and sound for the house pictures: a television on either back wall (off, playing a sunset, or paused with the pause mark), a monitor on a stand, a laptop, and a speaker that shows sound while it plays. A screen that is on lights the room a cool blue.
 * Ported from hearth-concept/clay2/things-b.js (screens and sound).
 * Used by: items.ts, the examples.
 */
import type { Point3 } from '../../clay';
import type { Paint } from '../colors';
import { TAU, type Stage } from '../stage';
import { sound } from './effects';
import { quadX, quadY } from './wall';

/** What a screen shows. */
export type ScreenState = 'off' | 'playing' | 'paused';

function screen(st: Stage, q: Point3[], pa: Point3, pb: Point3, state: ScreenState, xc: number, yc: number, zc: number): void {
  const c = st.c;
  const pth = st.path(q);
  if (state === 'off') {
    st.fill(q, '#2B2D33');
    c.save();
    c.clip(pth);
    c.globalAlpha = 0.12;
    const p0 = st.P(...q[3]);
    const p1 = st.P(...q[1]);
    c.beginPath();
    c.moveTo(p0[0], p0[1]);
    c.lineTo((p0[0] + p1[0]) / 2, p1[1]);
    c.lineTo(p0[0], p1[1]);
    c.fillStyle = '#FFFFFF';
    c.fill();
    c.restore();
    return;
  }
  const g = st.K.grad(pa, pb, '#2F3F7A', '#F2B48C');
  g.addColorStop(0.5, '#B8627C');
  c.fillStyle = g;
  c.fill(pth);
  c.save();
  c.clip(pth);
  const w = q[1].map((v, i) => v - q[0][i]);
  const h = q[3].map((v, i) => v - q[0][i]);
  const at = (u: number, v: number): Point3 => [q[0][0] + w[0] * u + h[0] * v, q[0][1] + w[1] * u + h[1] * v, q[0][2] + w[2] * u + h[2] * v];
  st.fill([at(0, 0), at(1, 0), at(1, 0.3), at(0.7, 0.42), at(0.4, 0.3), at(0, 0.38)], 'rgba(30,26,48,.55)', false);
  const sun = st.P(...at(0.66, 0.6));
  c.beginPath();
  c.arc(sun[0], sun[1], 0.07 * st.s, 0, TAU);
  c.fillStyle = '#FFE6C4';
  c.fill();
  st.line(at(0.08, 0.1), at(0.92, 0.1), 'rgba(255,255,255,.35)', st.lw(1.6));
  st.line(at(0.08, 0.1), at(0.52, 0.1), '#F4A595', st.lw(1.6));
  const paused = state === 'paused';
  if (paused) {
    st.fill([at(0, 0), at(1, 0), at(1, 1), at(0, 1)], 'rgba(20,18,30,.42)', false);
    for (const u of [0.44, 0.53]) st.fill([at(u, 0.36), at(u + 0.045, 0.36), at(u + 0.045, 0.7), at(u, 0.7)], 'rgba(255,255,255,.92)', false);
  }
  c.restore();
  st.emit(pth, paused ? '#C4C4D0' : '#FFFFFF');
  st.light(xc, yc, 0.5, { r: paused ? 2.3 : 3, col: [150, 170, 255], a: paused ? 0.38 : 0.62 });
  st.halo(xc, yc, zc, 0.75, [150, 170, 255], paused ? 0.22 : 0.38);
}

/** A television on the right wall, between x0 and x1, from z0 to z1. */
export function tvY(st: Stage, x0: number, x1: number, z0: number, z1: number, state: ScreenState = 'off'): void {
  st.add(
    (x0 + x1) / 2,
    0.04,
    () => {
      st.box(x0, 0.014, z0, x1 - x0, 0.05, z1 - z0, st.col.ink, { flat: true });
      screen(st, quadY(x0 + 0.03, x1 - 0.03, z0 + 0.03, z1 - 0.03, 0.066), [x0, 0.066, z1], [x1, 0.066, z0], state, (x0 + x1) / 2, 0.7, (z0 + z1) / 2);
    },
    -5,
  );
}

/** A television on the left wall, between y0 and y1. */
export function tvX(st: Stage, y0: number, y1: number, z0: number, z1: number, state: ScreenState = 'off'): void {
  st.add(
    0.04,
    (y0 + y1) / 2,
    () => {
      st.box(0.014, y0, z0, 0.05, y1 - y0, z1 - z0, st.col.ink, { flat: true });
      screen(st, quadX(y0 + 0.03, y1 - 0.03, z0 + 0.03, z1 - 0.03, 0.066), [0.066, y1, z1], [0.066, y0, z0], state, 0.7, (y0 + y1) / 2, (z0 + z1) / 2);
    },
    -5,
  );
}

/** A monitor on a stand, facing us. */
export function monitor(st: Stage, x: number, y: number, z: number, w = 0.6, on = false): void {
  const C = st.col;
  st.cyl(x, y, z, 0.09, 0.015, C.graphite);
  st.box(x - 0.02, y - 0.02, z, 0.04, 0.04, 0.14, C.graphite, { flat: true });
  st.box(x - w / 2, y - 0.02, z + 0.12, w, 0.035, 0.36, C.ink, { flat: true });
  const q = quadY(x - w / 2 + 0.025, x + w / 2 - 0.025, z + 0.145, z + 0.455, y + 0.017);
  if (!on) {
    st.fill(q, '#2B2D33');
    return;
  }
  const p = st.fill(q, '#DCE9F5');
  st.fill(quadY(x - w / 2 + 0.06, x + w / 2 - 0.2, z + 0.36, z + 0.41, y + 0.018), '#9DB4C4');
  st.fill(quadY(x - w / 2 + 0.06, x + w / 2 - 0.08, z + 0.2, z + 0.32, y + 0.018), '#FFFFFF');
  st.emit(p, '#FFFFFF');
  st.light(x, y + 0.5, 0.5, { r: 1.5, col: [190, 210, 255], a: 0.5 });
}

export interface SpeakerOpts {
  w?: number;
  d?: number;
  h?: number;
  col?: Paint;
  playing?: boolean;
  /** Size of the sound marks. */
  k?: number;
}

/** A speaker standing on (x, y, z); sound rises from it while it plays. */
export function speaker(st: Stage, x: number, y: number, z: number, o: SpeakerOpts = {}): void {
  const w = o.w ?? 0.14;
  const d = o.d ?? 0.14;
  const h = o.h ?? 0.2;
  st.rbox(x - w / 2, y - d / 2, z, w, d, h, Math.min(w, d) * 0.3, st.paint(o.col, st.col.graphite));
  if (o.playing) sound(st, x, y, z + h + 0.05, o.k ?? 1);
}

export function laptop(st: Stage, x: number, y: number, z: number, on = false): void {
  const C = st.col;
  st.box(x, y, z, 0.3, 0.2, 0.015, C.steel, { flat: true });
  st.fill(quadY(x, x + 0.3, z + 0.015, z + 0.21, y + 0.004), C.steel);
  const p = st.fill(quadY(x + 0.015, x + 0.285, z + 0.03, z + 0.195, y + 0.006), on ? '#E4EEF7' : '#2B2D33');
  if (on) st.emit(p, '#FFFFFF');
}
