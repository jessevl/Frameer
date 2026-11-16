/**
 * @file outline.ts
 * @description Plan geometry for houses drawn from room outlines: signed area and orientation, centroids, a polygon
 * grown outward (mitred), a point inside a polygon, and the walls of a floor: every room edge split where it meets a
 * neighbour's edge (a shared wall, drawn once as a cut partition) and where it does not (an outside wall), each with
 * its outward normal, whether it faces the viewer (low cut wall) or away (tall back wall, unless part of the house lies
 * behind it), and the openings (doors, windows, passages) that sit in it as stretches along it.
 * Used by: house.ts (the outline floor), tests.
 */
import type { Pt2 } from './stage';

/** Twice the signed area: positive when the points run counter-clockwise in plan (x right, y down: clockwise on screen). */
export function signedArea2(pts: readonly Pt2[]): number {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    s += a[0] * b[1] - b[0] * a[1];
  }
  return s;
}

/** The outline with positive signed area, so (dy, -dx) of each edge points out. */
export function oriented(pts: readonly Pt2[]): Pt2[] {
  return signedArea2(pts) < 0 ? pts.slice().reverse() : pts.slice();
}

/** The area centroid of a simple polygon (the mean of the corners for a degenerate one). */
export function centroid(pts: readonly Pt2[]): Pt2 {
  const a2 = signedArea2(pts);
  if (Math.abs(a2) < 1e-9) {
    const n = pts.length || 1;
    return [pts.reduce((s, p) => s + p[0], 0) / n, pts.reduce((s, p) => s + p[1], 0) / n];
  }
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const k = a[0] * b[1] - b[0] * a[1];
    cx += (a[0] + b[0]) * k;
    cy += (a[1] + b[1]) * k;
  }
  return [cx / (3 * a2), cy / (3 * a2)];
}

/** Whether a point lies inside a polygon (even-odd). */
export function insidePoly(p: Pt2, pts: readonly Pt2[]): boolean {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i];
    const b = pts[j];
    if (a[1] > p[1] !== b[1] > p[1] && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}

/** A point of the polygon's inside near its centroid: the centroid when it is inside, else the middle of the widest run across it. */
export function innerPoint(pts: readonly Pt2[]): Pt2 {
  const c = centroid(pts);
  if (insidePoly(c, pts)) return c;
  const xs: number[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    if (a[1] > c[1] !== b[1] > c[1]) xs.push(a[0] + ((c[1] - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
  }
  xs.sort((p, q) => p - q);
  let best: Pt2 = c;
  let wide = -1;
  for (let i = 0; i + 1 < xs.length; i += 2) {
    if (xs[i + 1] - xs[i] > wide) {
      wide = xs[i + 1] - xs[i];
      best = [(xs[i] + xs[i + 1]) / 2, c[1]];
    }
  }
  return best;
}

/** The polygon grown outward by d (mitred corners, capped at 3 d). */
export function grown(pts: readonly Pt2[], d: number): Pt2[] {
  const p = oriented(pts);
  const n = p.length;
  const out: Pt2[] = [];
  for (let i = 0; i < n; i++) {
    const a = p[(i - 1 + n) % n];
    const b = p[i];
    const c = p[(i + 1) % n];
    const n1 = norm(b[1] - a[1], -(b[0] - a[0]));
    const n2 = norm(c[1] - b[1], -(c[0] - b[0]));
    let mx = n1[0] + n2[0];
    let my = n1[1] + n2[1];
    const ml = Math.hypot(mx, my) || 1;
    mx /= ml;
    my /= ml;
    const cos = mx * n1[0] + my * n1[1];
    const k = Math.min(3, 1 / Math.max(0.2, cos)) * d;
    out.push([b[0] + mx * k, b[1] + my * k]);
  }
  return out;
}

function norm(x: number, y: number): Pt2 {
  const l = Math.hypot(x, y) || 1;
  return [x / l, y / l];
}

/** A door, window or passage in a wall: the stretch it takes, as two points on the wall. */
export interface OpeningLike {
  a: Pt2;
  b: Pt2;
}

/** One straight stretch of wall. */
export interface WallSeg {
  a: Pt2;
  b: Pt2;
  /** The room it belongs to (index), and the room on the other side for a shared wall. */
  room: number;
  other: number | null;
  /** The outward normal of `room`. */
  nx: number;
  ny: number;
  /** Faces away from the viewer (a back wall or the back side of a partition). */
  back: boolean;
  /** Outside wall facing away with nothing of the floor behind it: drawn full height. */
  tall: boolean;
  /** The openings in it, as [from, to] along it (0 at a, 1 at b), with their index. */
  openings: { t0: number; t1: number; i: number }[];
}

const EPS = 0.02;

function collinear(a: Pt2, b: Pt2, c: Pt2, d: Pt2): boolean {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const dist = (p: Pt2) => Math.abs((b[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (b[1] - a[1])) / L;
  return dist(c) < EPS && dist(d) < EPS;
}

function param(a: Pt2, b: Pt2, p: Pt2): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const L2 = dx * dx + dy * dy || 1;
  return ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2;
}

const lerp = (a: Pt2, b: Pt2, t: number): Pt2 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/** Whether a ray from p in direction (dx, dy) crosses a polygon's edge. */
function rayHits(p: Pt2, dx: number, dy: number, pts: readonly Pt2[]): boolean {
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const ex = b[0] - a[0];
    const ey = b[1] - a[1];
    const den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-12) continue;
    const t = ((a[0] - p[0]) * ey - (a[1] - p[1]) * ex) / den;
    const u = ((a[0] - p[0]) * dy - (a[1] - p[1]) * dx) / den;
    if (t > 1e-6 && u >= 0 && u <= 1) return true;
  }
  return false;
}

/** The walls of a floor of room outlines: split, classified, with their openings. */
export function walls(rooms: readonly (readonly Pt2[])[], openings: readonly OpeningLike[] = []): WallSeg[] {
  const polys = rooms.map(oriented);
  const out: WallSeg[] = [];
  polys.forEach((poly, ri) => {
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % poly.length];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len < 1e-6) continue;
      const nrm = norm(b[1] - a[1], -(b[0] - a[0]));
      // Where neighbours' edges lie along this one.
      const cover: { t0: number; t1: number; j: number }[] = [];
      polys.forEach((q, rj) => {
        if (rj === ri) return;
        for (let k = 0; k < q.length; k++) {
          const c = q[k];
          const d = q[(k + 1) % q.length];
          if (!collinear(a, b, c, d)) continue;
          const t0 = Math.max(0, Math.min(param(a, b, c), param(a, b, d)));
          const t1 = Math.min(1, Math.max(param(a, b, c), param(a, b, d)));
          if ((t1 - t0) * len > EPS) cover.push({ t0, t1, j: rj });
        }
      });
      cover.sort((p, q) => p.t0 - q.t0);
      const pieces: { t0: number; t1: number; other: number | null }[] = [];
      let t = 0;
      for (const c of cover) {
        if (c.t0 > t + 1e-6) pieces.push({ t0: t, t1: c.t0, other: null });
        if (c.t1 > t) {
          pieces.push({ t0: Math.max(t, c.t0), t1: c.t1, other: c.j });
          t = c.t1;
        }
      }
      if (t < 1 - 1e-6) pieces.push({ t0: t, t1: 1, other: null });
      for (const p of pieces) {
        if ((p.t1 - p.t0) * len < EPS) continue;
        const pa = lerp(a, b, p.t0);
        const pb = lerp(a, b, p.t1);
        const facing = nrm[0] + nrm[1];
        const back = facing < -0.03 || (Math.abs(facing) <= 0.03 && p.other !== null && ri < p.other);
        let tall = false;
        if (p.other === null && facing < -0.03) {
          // Tall only when no part of the floor lies behind it.
          tall = true;
          for (let s = 1; s <= 5 && tall; s++) {
            const m = lerp(pa, pb, s / 6);
            const from: Pt2 = [m[0] + nrm[0] * 0.03, m[1] + nrm[1] * 0.03];
            if (polys.some((q) => rayHits(from, -1, -1, q))) tall = false;
          }
        }
        const segOpenings: WallSeg['openings'] = [];
        openings.forEach((o, oi) => {
          if (!collinear(pa, pb, o.a, o.b)) return;
          const t0 = Math.max(0, Math.min(param(pa, pb, o.a), param(pa, pb, o.b)));
          const t1 = Math.min(1, Math.max(param(pa, pb, o.a), param(pa, pb, o.b)));
          if (t1 - t0 > 1e-6) segOpenings.push({ t0, t1, i: oi });
        });
        segOpenings.sort((p2, q2) => p2.t0 - q2.t0);
        out.push({ a: pa, b: pb, room: ri, other: p.other, nx: nrm[0], ny: nrm[1], back, tall, openings: segOpenings });
      }
    }
  });
  return out;
}

/** The stretches of a wall left solid between its openings, as [from, to] along it. */
export function solidRuns(seg: Pick<WallSeg, 'openings'>): [number, number][] {
  const out: [number, number][] = [];
  let t = 0;
  for (const o of seg.openings) {
    if (o.t0 > t + 1e-6) out.push([t, o.t0]);
    t = Math.max(t, o.t1);
  }
  if (t < 1 - 1e-6) out.push([t, 1]);
  return out;
}

/** The point at t along a wall. */
export function along(seg: { a: Pt2; b: Pt2 }, t: number): Pt2 {
  return lerp(seg.a, seg.b, t);
}
