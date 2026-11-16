/**
 * @file people.ts
 * @description People in the house pictures: peg dolls, standing or sitting, facing us, away from us, or turned left or right. A person has no face, only skin where the face is, so nobody in a picture is anybody in particular.
 * Ported from hearth-concept/clay2/things-a.js (personNow, person).
 * Used by: items.ts, furniture.ts (people on sofas and chairs), rooms.ts (sleepers), the examples.
 */
import { dk, lt, type Paint } from '../colors';
import { TAU, type Stage } from '../stage';

/** One person in a scene. */
export interface Person {
  shirt?: Paint;
  hair?: Paint;
  pants?: Paint;
  facing?: 'front' | 'back' | 'left' | 'right';
  pose?: 'stand' | 'sit';
  /** Size, 1 for a grown-up. */
  k?: number;
}

export interface PersonOpts extends Person {
  /** What they stand or sit on. */
  z?: number;
  noShadow?: boolean;
  bias?: number;
}

/** Draws a person now. */
export function personNow(st: Stage, x: number, y: number, o: PersonOpts = {}): void {
  const C = st.col;
  const c = st.c;
  const k = o.k ?? 1;
  const z = o.z ?? 0;
  const shirt = st.paint(o.shirt, C.coral);
  const hair = st.paint(o.hair, C.hairA);
  let hz: number;
  if (o.pose === 'sit') {
    st.cone(x, y, z, 0.155 * k, 0.12 * k, 0.33 * k, shirt);
    hz = z + 0.33 * k;
  } else {
    if (!o.noShadow) st.shadowC(x, y, 0.16 * k, { h: 0.5, a: 0.22 });
    st.cone(x, y, z, 0.105 * k, 0.12 * k, 0.3 * k, st.paint(o.pants, C.navy));
    st.cone(x, y, z + 0.3 * k, 0.155 * k, 0.115 * k, 0.36 * k, shirt);
    hz = z + 0.66 * k;
  }
  const r = 0.122 * k;
  st.sph(x, y, hz + r * 0.9, r, hair);
  if (o.facing === 'back') return;
  const [hx, hy] = st.P(x, y, hz + r * 0.9);
  const R = r * st.s;
  c.save();
  c.beginPath();
  c.arc(hx, hy, R, 0, TAU);
  c.clip();
  const fx = o.facing === 'left' ? -0.3 : o.facing === 'right' ? 0.3 : 0;
  const g = c.createRadialGradient(hx + fx * R - R * 0.3, hy + R * 0.2, R * 0.1, hx + fx * R, hy + R * 0.46, R * 0.9);
  g.addColorStop(0, lt(C.skin, 0.35));
  g.addColorStop(1, dk(C.skin, 0.06));
  c.beginPath();
  c.arc(hx + fx * R, hy + R * 0.46, R * 0.88, 0, TAU);
  c.fillStyle = g;
  c.fill();
  c.restore();
}

/** Queues a person at their place. */
export function person(st: Stage, x: number, y: number, o: PersonOpts = {}): void {
  st.add(x, y, () => personNow(st, x, y, o), o.bias ?? 0);
}
