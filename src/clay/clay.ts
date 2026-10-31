/**
 * @file clay.ts
 * @description The clay kit: an isometric projection with soft-shaded boxes, cylinders, spheres, discs, shadows and glows, drawn on a 2D canvas in the theme's clay tokens (`--clay-*` in tokens.css). The pictures of the sister apps (Drift's desk, done pile, boat, empty states) are built from these few shapes, so they share one light and one material.
 * Used by: ClayCanvas and the apps' picture scenes.
 */
import { mix } from '../icons/palette';

/** The nine clay greys, from the lightest (0) to the darkest (8). */
export type Greys = readonly [string, string, string, string, string, string, string, string, string];

/** The clay colors of one theme, read from the `--clay-*` tokens. */
export interface ClayPalette {
  g: Greys;
  coral: string;
  coralLight: string;
  coralDeep: string;
  /** "r,g,b" of contact shadows. */
  shade: string;
  /** "r,g,b" of lamp light. */
  warm: string;
  /** How much a top face lightens, and a right face darkens. */
  top: number;
  side: number;
  dark: boolean;
}

/** The three lit faces of one material, and the highlight on its front edges. */
export interface Material {
  t: string;
  l: string;
  r: string;
  e: string;
}

export type Point3 = readonly [number, number, number];

const COS30 = Math.cos(Math.PI / 6);

/** A material from one base color: the top catches the light, the right face falls away from it. */
export function material(base: string, pal: ClayPalette): Material {
  return { t: mix(base, '#FFFFFF', pal.top), l: base, r: mix(base, '#000000', pal.side), e: mix(base, '#FFFFFF', pal.top + 0.2) };
}

/**
 * One isometric drawing at an origin and a scale: x runs down to the right, y down to the left, z up. Every shape takes
 * a base color (or a ready material) and draws its faces back to front, so a scene draws its parts back to front too.
 */
export class Clay {
  constructor(
    readonly c: CanvasRenderingContext2D,
    readonly ox: number,
    readonly oy: number,
    readonly s: number,
    readonly pal: ClayPalette,
  ) {}

  /** Screen position of a point. */
  p(x: number, y: number, z: number): [number, number] {
    return [this.ox + (x - y) * COS30 * this.s, this.oy + (x + y) * 0.5 * this.s - z * this.s];
  }

  path(pts: readonly Point3[]): void {
    const c = this.c;
    c.beginPath();
    pts.forEach((q, i) => {
      const [a, b] = this.p(q[0], q[1], q[2]);
      if (i) c.lineTo(a, b);
      else c.moveTo(a, b);
    });
    c.closePath();
  }

  poly(pts: readonly Point3[], fill: string | CanvasGradient, edge?: string): this {
    this.path(pts);
    this.c.fillStyle = fill;
    this.c.fill();
    if (edge) {
      this.c.strokeStyle = edge;
      this.c.lineWidth = 1;
      this.c.stroke();
    }
    return this;
  }

  grad(a: Point3, b: Point3, c0: string, c1: string): CanvasGradient {
    const [x0, y0] = this.p(a[0], a[1], a[2]);
    const [x1, y1] = this.p(b[0], b[1], b[2]);
    const g = this.c.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, c0);
    g.addColorStop(1, c1);
    return g;
  }

  private mat(color: string | Material): Material {
    return typeof color === 'string' ? material(color, this.pal) : color;
  }

  /** A box from (x, y, z), w along x, d along y, h up. `flat` leaves out the highlight on the front edges. */
  box(x: number, y: number, z: number, w: number, d: number, h: number, color: string | Material, o: { flat?: boolean } = {}): this {
    const m = this.mat(color);
    this.poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], this.grad([x, y + d, z + h], [x, y + d, z], m.l, mix(m.l, '#000000', 0.05)));
    this.poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], this.grad([x + w, y, z + h], [x + w, y, z], m.r, mix(m.r, '#000000', 0.06)));
    this.poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], m.t);
    if (!o.flat) {
      const c = this.c;
      c.beginPath();
      c.moveTo(...this.p(x, y + d, z + h));
      c.lineTo(...this.p(x + w, y + d, z + h));
      c.lineTo(...this.p(x + w, y, z + h));
      c.strokeStyle = m.e;
      c.lineWidth = 1;
      c.globalAlpha = this.pal.dark ? 0.35 : 0.9;
      c.stroke();
      c.globalAlpha = 1;
    }
    return this;
  }

  /** The screen ellipse of a circle of radius r lying flat at (x, y, z): center and radii. */
  ell(x: number, y: number, z: number, r: number): [number, number, number, number] {
    const [cx, cy] = this.p(x, y, z);
    return [cx, cy, 1.2247 * r * this.s, 0.7071 * r * this.s];
  }

  disc(x: number, y: number, z: number, r: number, fill: string): this {
    const [cx, cy, rx, ry] = this.ell(x, y, z, r);
    this.c.beginPath();
    this.c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    this.c.fillStyle = fill;
    this.c.fill();
    return this;
  }

  ring(x: number, y: number, z: number, r: number, stroke: string, width = 1, alpha = 1): this {
    const [cx, cy, rx, ry] = this.ell(x, y, z, r);
    const c = this.c;
    c.beginPath();
    c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    c.strokeStyle = stroke;
    c.lineWidth = width;
    c.globalAlpha = alpha;
    c.stroke();
    c.globalAlpha = 1;
    return this;
  }

  /** An upright cylinder standing on (x, y, z). `open` leaves the top off (a cup seen from the side). */
  cyl(x: number, y: number, z: number, r: number, h: number, color: string | Material, o: { open?: boolean; topFill?: string } = {}): this {
    const m = this.mat(color);
    const [cx, cy, rx, ry] = this.ell(x, y, z, r);
    const top = cy - h * this.s;
    const c = this.c;
    const g = c.createLinearGradient(cx - rx, 0, cx + rx, 0);
    g.addColorStop(0, m.l);
    g.addColorStop(0.55, mix(m.l, m.r, 0.4));
    g.addColorStop(1, m.r);
    c.beginPath();
    c.moveTo(cx - rx, top);
    c.lineTo(cx - rx, cy);
    c.ellipse(cx, cy, rx, ry, 0, Math.PI, 0, true);
    c.lineTo(cx + rx, top);
    c.closePath();
    c.fillStyle = g;
    c.fill();
    if (!o.open) {
      c.beginPath();
      c.ellipse(cx, top, rx, ry, 0, 0, Math.PI * 2);
      c.fillStyle = o.topFill ?? m.t;
      c.fill();
    }
    return this;
  }

  sphere(x: number, y: number, z: number, r: number, color: string | Material): [number, number, number] {
    const m = this.mat(color);
    const [cx, cy] = this.p(x, y, z);
    const R = r * this.s;
    const c = this.c;
    const g = c.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
    g.addColorStop(0, m.t);
    g.addColorStop(0.55, m.l);
    g.addColorStop(1, m.r);
    c.beginPath();
    c.arc(cx, cy, R, 0, Math.PI * 2);
    c.fillStyle = g;
    c.fill();
    return [cx, cy, R];
  }

  /** A soft contact shadow under something of radius r. Dark mode needs it stronger to read at all. */
  shadow(x: number, y: number, z: number, r: number, alpha = 0.16): this {
    const [cx, cy, rx, ry] = this.ell(x, y, z, r);
    const c = this.c;
    const a = alpha * (this.pal.dark ? 2.2 : 1);
    c.save();
    c.translate(cx, cy);
    c.scale(1, ry / rx);
    const g = c.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, `rgba(${this.pal.shade},${a})`);
    g.addColorStop(1, `rgba(${this.pal.shade},0)`);
    c.fillStyle = g;
    c.beginPath();
    c.arc(0, 0, rx, 0, Math.PI * 2);
    c.fill();
    c.restore();
    return this;
  }

  /** A round glow of light, radius R in pixels. */
  glow(x: number, y: number, z: number, R: number, rgb: string, alpha: number): this {
    const [cx, cy] = this.p(x, y, z);
    const c = this.c;
    const g = c.createRadialGradient(cx, cy, 0, cx, cy, R);
    g.addColorStop(0, `rgba(${rgb},${alpha})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    c.fillStyle = g;
    c.fillRect(cx - R, cy - R, R * 2, R * 2);
    return this;
  }

  line(a: Point3, b: Point3, stroke: string, width = 1): this {
    const c = this.c;
    c.beginPath();
    c.moveTo(...this.p(a[0], a[1], a[2]));
    c.lineTo(...this.p(b[0], b[1], b[2]));
    c.strokeStyle = stroke;
    c.lineWidth = width;
    c.lineCap = 'round';
    c.stroke();
    return this;
  }
}

/** The part of the day a picture is lit for. */
export type Phase = 'morning' | 'day' | 'evening' | 'night';

export function phaseOf(hour: number): Phase {
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'day';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/** 0 to 1 along an ease-out curve; values outside are clamped. */
export function easeOut(p: number): number {
  const q = Math.max(0, Math.min(1, p));
  return 1 - Math.pow(1 - q, 3);
}

/** A point on an arc from a to b that lifts by `lift` pixels at its middle (something carried from one place to another). */
export function arc(a: readonly [number, number], b: readonly [number, number], p: number, lift: number): [number, number] {
  return [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p - Math.sin(Math.PI * p) * lift];
}

/** A stable pseudo-random number in [0, 1) for an integer seed, for jitter that does not change between frames. */
export function hash(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}
