/**
 * @file pieces.ts
 * @description Smaller pieces for the house pictures that the concept drew inline in its rooms, here as named, generic objects: low sideboards along either back wall, a round side table, a cupboard, a chest, a bench, a coat rack, an umbrella stand, shoes, a stack of boxes, a tall mirror, a pinboard with notes, a waste-paper bin, a printer, an orb on a stand, coloured dots on a wall, a light over a mirror, a light strip under a shelf, a bare pool of light for hidden spots, and the primitives a scene may use for anything else: a rounded block, a ball, a cylinder, a pipe and a stub of cut wall.
 * Ported from the inline drawings in hearth-concept/clay2/house.js (FURNISH) and extras.js (heat).
 * Used by: items.ts.
 */
import type { Point3 } from '../../clay';
import { WARM, dk, type Paint, type RGB } from '../colors';
import { circ, type PrismOpts, type Stage } from '../stage';
import type { On } from './furniture';
import { circX, quadY } from './wall';

/** A low sideboard against the right wall (y = 0), from x along it; things stand on it at its top. */
export function sideboardY(st: Stage, x: number, y: number, w: number, d: number, h: number, o: { col?: Paint; doors?: number; on?: On; bias?: number } = {}): void {
  st.add(
    x + w / 2,
    y + d / 2,
    () => {
      const col = st.paint(o.col, st.col.oak);
      st.shadowR(x, y, w, d, { h: 0.3, a: 0.18 });
      st.rbox(x, y, 0.05, w, d, h - 0.05, 0.04, col);
      const n = o.doors ?? 3;
      for (let i = 1; i < n; i++) st.line([x + (w * i) / n, y + d + 0.004, 0.07], [x + (w * i) / n, y + d + 0.004, h - 0.02], dk(col, 0.18), 1);
      o.on?.(h);
    },
    o.bias ?? 0,
  );
}

/** A low sideboard against the left wall (x = 0), from y along it. */
export function sideboardX(st: Stage, x: number, y: number, w: number, d: number, h: number, o: { col?: Paint; on?: On; bias?: number } = {}): void {
  st.add(
    x + w / 2,
    y + d / 2,
    () => {
      st.shadowR(x, y, w, d, { h: 0.3, a: 0.18 });
      st.rbox(x, y, 0.05, w, d, h - 0.05, 0.04, st.paint(o.col, st.col.walnut));
      o.on?.(h);
    },
    o.bias ?? 0,
  );
}

/** A round side table, a solid drum. */
export function sideTable(st: Stage, x: number, y: number, r = 0.2, h = 0.4, o: { col?: Paint; on?: On } = {}): void {
  st.add(x, y, () => {
    st.shadowC(x, y, r, { h: 0.3, a: 0.16 });
    st.prism(circ(x, y, r, 16), 0, h, st.paint(o.col, st.col.walnut));
    o.on?.(h);
  });
}

/** A cupboard with one door, its handle at the front's left. */
export function cupboard(st: Stage, x: number, y: number, w: number, d: number, h: number, o: { col?: Paint; on?: On } = {}): void {
  st.add(x + w / 2, y + d / 2, () => {
    st.shadowR(x, y, w, d, { h: 0.4, a: 0.16 });
    st.rbox(x, y, 0, w, d, h, 0.05, st.paint(o.col, st.col.cream));
    st.line([x + 0.07, y + d + 0.003, h * 0.54], [x + 0.07, y + d + 0.003, h * 0.86], st.col.greyDeep, 2);
    o.on?.(h);
  });
}

/** A chest with a lid that overhangs. */
export function chest(st: Stage, x: number, y: number, w: number, d: number, h: number, o: { col?: Paint; lid?: Paint } = {}): void {
  st.add(x + w / 2, y + d / 2, () => {
    st.shadowR(x, y, w, d, { h: 0.3, a: 0.16 });
    st.rbox(x, y, 0, w, d, h, 0.06, st.paint(o.col, st.col.sage));
    st.rbox(x - 0.02, y - 0.02, h, w + 0.04, d + 0.04, 0.05, 0.07, st.paint(o.lid, st.col.sageDeep));
  });
}

/** An upholstered bench on two legs. */
export function bench(st: Stage, x: number, y: number, w: number, d: number, o: { col?: Paint; leg?: Paint; h?: number } = {}): void {
  st.add(x + w / 2, y + d / 2, () => {
    const h = o.h ?? 0.2;
    st.shadowR(x, y, w, d, { h: 0.25, a: 0.16 });
    for (const lx of [x + 0.05, x + w - 0.07]) st.box(lx, y + 0.04, 0, 0.04, d - 0.08, h, st.paint(o.leg, st.col.walnut), { flat: true });
    st.rbox(x, y, h, w, d, 0.09, 0.08, st.paint(o.col, st.col.linenDeep), { soft: 0.4 });
  });
}

/** A coat rack along y: a low bench, two posts, a rail and coats (colour, length). */
export function coatRack(st: Stage, x: number, y: number, w: number, d: number, o: { col?: Paint; coats?: readonly (readonly [Paint, number])[] } = {}): void {
  st.add(x + w / 2, y + d / 2 - 0.04, () => {
    const C = st.col;
    const cx = x + w / 2;
    st.shadowR(x, y, w, d, { h: 0.6, a: 0.18 });
    st.rbox(x, y, 0.03, w, d, 0.2, 0.04, st.paint(o.col, C.oak));
    for (const py of [y + 0.04, y + d - 0.04]) st.line([cx, py, 0.23], [cx, py, 1.0], C.walnut, Math.max(1.4, st.s / 26));
    st.line([cx, y + 0.04, 1.0], [cx, y + d - 0.04, 1.0], C.walnut, Math.max(1.6, st.s / 22));
    const coats = o.coats ?? [
      ['coral', 0.5],
      ['navy', 0.56],
      ['mustard', 0.42],
      ['sageDeep', 0.5],
    ];
    coats.forEach(([col, len], i) => st.rbox(cx - 0.09, y + 0.1 + i * 0.18, 0.94 - len, 0.18, 0.14, len, 0.05, st.paint(col, C.blue), { soft: 0.3 }));
  });
}

/** An umbrella stand with two umbrellas. */
export function umbrellaStand(st: Stage, x: number, y: number, o: { col?: Paint } = {}): void {
  st.add(x, y, () => {
    const C = st.col;
    st.cone(x, y, 0, 0.09, 0.11, 0.28, st.paint(o.col, C.sageDeep), { topFill: C.ink });
    st.line([x, y, 0.2], [x - 0.06, y, 0.62], C.navy, 2);
    st.line([x + 0.02, y + 0.01, 0.2], [x + 0.1, y + 0.01, 0.56], C.coral, 2);
  });
}

/** Pairs of shoes in a row along x. */
export function shoes(st: Stage, x: number, y: number, o: { cols?: readonly Paint[] } = {}): void {
  st.add(x + 0.08, y + 0.08, () => {
    const cols = o.cols ?? ['ink', 'ink', 'coralLight', 'coralLight'];
    const steps = [0, 0.12, 0.3, 0.4];
    cols.forEach((col, i) => st.rbox(x + (steps[i] ?? i * 0.12), y, 0, 0.08, 0.2, 0.06, 0.03, st.paint(col, st.col.ink)));
  });
}

/** Boxes stacked on each other, each layer inset a little. */
export function boxStack(st: Stage, x: number, y: number, w: number, d: number, layers: readonly { h: number; col: Paint; inset?: number }[]): void {
  st.add(x + w / 2, y + d / 2, () => {
    st.shadowR(x, y, w, d, { h: 0.4, a: 0.16 });
    let z = 0;
    for (const l of layers) {
      const i = l.inset ?? 0;
      st.rbox(x + i, y + i, z, w - i * 2, d - i * 2, l.h, 0.04, st.paint(l.col, st.col.linenDeep));
      z += l.h;
    }
  });
}

/** A tall mirror standing on the plane x = at, from y over w. */
export function tallMirrorX(st: Stage, at: number, y: number, w = 0.6, h = 1.0, o: { frame?: Paint } = {}): void {
  st.add(at + 0.06, y + w / 2, () => {
    st.box(at, y, 0, 0.05, w, h, st.paint(o.frame, st.col.oak));
    const fx = at + 0.055;
    st.fill([[fx, y + 0.04, 0.06], [fx, y + w - 0.04, 0.06], [fx, y + w - 0.04, h - 0.04], [fx, y + 0.04, h - 0.04]], st.col.glass);
    st.line([fx + 0.001, y + 0.14, 0.2], [fx + 0.001, y + 0.36, 0.8], '#FFFFFF', Math.max(1.5, st.s / 18), 0.5);
  });
}

/** A pinboard on the right wall with notes (x, z, colour). */
export function pinboardY(st: Stage, x0: number, x1: number, z0: number, z1: number, notes: readonly (readonly [number, number, Paint])[] = []): void {
  const C = st.col;
  st.fill(quadY(x0, x1, z0, z1, 0.012), C.oak);
  st.fill(quadY(x0 + 0.04, x1 - 0.04, z0 + 0.04, z1 - 0.04, 0.014), '#D9C3A0');
  for (const [x, z, col] of notes) st.fill(quadY(x, x + 0.17, z, z + 0.15, 0.016), st.paint(col, C.white));
}

/** A waste-paper bin with a crumpled sheet. */
export function paperBin(st: Stage, x: number, y: number): void {
  st.add(x, y, () => {
    st.cone(x, y, 0, 0.11, 0.14, 0.26, st.col.graphite, { topFill: st.col.ink });
    st.sph(x - 0.02, y - 0.01, 0.27, 0.05, st.col.white);
  });
}

/** A printer with a sheet in its tray. */
export function printer(st: Stage, x: number, y: number, z: number): void {
  const C = st.col;
  st.rbox(x, y, z, 0.5, 0.34, 0.16, 0.03, C.white);
  st.fill([[x + 0.08, y + 0.06, z + 0.162], [x + 0.42, y + 0.06, z + 0.162], [x + 0.42, y + 0.28, z + 0.162], [x + 0.08, y + 0.28, z + 0.162]], C.cream);
  st.box(x + 0.08, y + 0.34, z + 0.03, 0.34, 0.14, 0.01, C.white, { flat: true });
}

/** A ball on a small round stand. */
export function orb(st: Stage, x: number, y: number, z: number, o: { col?: Paint; r?: number; stand?: Paint } = {}): void {
  const r = o.r ?? 0.09;
  st.sph(x, y, z + r, r, st.paint(o.col, st.col.blueDeep));
  st.cyl(x, y, z, r * 0.55, 0.02, st.paint(o.stand, st.col.walnut));
}

/** Dots painted on the left wall: (y, z, radius). */
export function dotsX(st: Stage, dots: readonly (readonly [number, number, number])[], col?: Paint): void {
  for (const [y, z, r] of dots) st.fill(circX(y, z, r), st.paint(col, st.col.mustard));
}

/** A light bar over a mirror on the right wall, centred on x at z; lit, it lights the basin. */
export function mirrorLightY(st: Stage, x: number, z: number, on = false, w = 0.28): void {
  st.box(x - w / 2, 0.012, z, w, 0.05, 0.04, st.col.graphite, { flat: true });
  if (!on) return;
  st.light(x, 0.5, 0.6, { r: 1.5, a: 0.9 });
  st.halo(x, 0.05, z - 0.01, 0.3, WARM, 0.6);
}

/** A light strip under a shelf on the right wall, from x0 to x1 at height z, d out from the wall. */
export function lightStripY(st: Stage, x0: number, x1: number, z: number, lvl = 0, col: RGB = WARM, d = 0.2): void {
  if (!lvl) return;
  st.emit(st.fill(quadY(x0, x1, z, z + 0.02, d), '#FFF1DC'));
  for (let i = 0; i < 3; i++) st.light(x0 + 0.3 + (i * (x1 - x0 - 0.6)) / 2, 0.3, 0.7, { r: 1.2, col, a: lvl });
  st.halo((x0 + x1) / 2, d, z - 0.075, 1.0, col, 0.25);
}

/** A bare pool of light (spots hidden in a ceiling). */
export function spot(st: Stage, x: number, y: number, z: number, r: number, col: RGB, a: number): void {
  st.light(x, y, z, { r, col, a });
}

/** A rounded block: the primitive for anything a scene has no object for. */
export function block(st: Stage, x: number, y: number, z: number, w: number, d: number, h: number, col: string, o: PrismOpts & { r?: number; shadow?: boolean } = {}): void {
  if (o.shadow) st.shadowR(x, y, w, d, { h: Math.max(0.2, h), a: 0.16 });
  st.rbox(x, y, z, w, d, h, o.r ?? 0.03, col, o);
}

/** A ball; on the floor it casts a shadow. */
export function ball(st: Stage, x: number, y: number, z: number, r: number, col: string): void {
  if (!z) st.shadowC(x, y, r, { h: 0.15, a: 0.16 });
  st.sph(x, y, z + r, r, col);
}

/** An upright cylinder (a vase, a candle holder, a tin). */
export function cylinder(st: Stage, x: number, y: number, z: number, r: number, h: number, col: string): void {
  st.cyl(x, y, z, r, h, col);
}

/** A pipe or cable through points. */
export function pipe(st: Stage, pts: readonly Point3[], col: string, w = 2): void {
  st.pline(pts, col, w);
}

/** A stub of cut wall (a slice through the house in a close-up). */
export function wallStub(st: Stage, x: number, y: number, w: number, d: number, h: number): void {
  const C = st.col;
  st.box(x, y, 0, w, d, h, { t: C.cut, l: C.wall, r: dk(C.wall, 0.1), e: '#FFFFFF' });
}
