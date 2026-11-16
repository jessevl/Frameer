/**
 * @file stage.ts
 * @description The engine of the house pictures: a stage on Frameer's `Clay` projection that draws rounded prisms, rounded boxes, truncated cones, soft blurred footprint shadows and flat pieces on the two back walls, queues things at their plan position and draws them back to front, and collects the light (pools of lamp light held inside their room, halos, surfaces that give their own light) for the light pass (light.ts). Every `#RRGGBB` colour goes through the style (styles.ts), so one setting restyles every picture. A stage reports anchors (`marks`): screen positions of named things, for labels and callouts.
 * Ported from hearth-concept/clay2/engine.js (stage) and lido@frontend/src/components/pictures/engine.ts (Stage).
 * Used by: the objects (objects/*.ts), house.ts, closeup.ts, items.ts and the examples.
 */
import { mix } from '../../icons/palette';
import { Clay, type ClayPalette, type Material, type Point3 } from '../clay';
import { dk, lt, rgba, WARM, type Colors, type Paint, type RGB } from './colors';
import type { Style } from './styles';

export const TAU = Math.PI * 2;
export const C30 = Math.cos(Math.PI / 6);

/** A point in plan. */
export type Pt2 = readonly [number, number];

/** A stable pseudo-random number in [0, 1) for a seed. */
export function hsh(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/** A rounded rectangle in plan, as a polygon (n points per corner). */
export function rr(x: number, y: number, w: number, d: number, r: number, n = 4): Pt2[] {
  const q = Math.max(0.001, Math.min(r, w / 2, d / 2));
  const out: Pt2[] = [];
  const corners: [number, number, number][] = [
    [x + w - q, y + q, -90],
    [x + w - q, y + d - q, 0],
    [x + q, y + d - q, 90],
    [x + q, y + q, 180],
  ];
  for (const [cx, cy, a0] of corners) {
    for (let i = 0; i <= n; i++) {
      const a = ((a0 + (i * 90) / n) * Math.PI) / 180;
      out.push([cx + q * Math.cos(a), cy + q * Math.sin(a)]);
    }
  }
  return out;
}

/** A circle in plan, as a polygon. */
export function circ(x: number, y: number, r: number, n = 20): Pt2[] {
  return Array.from({ length: n }, (_, i) => [x + r * Math.cos((i / n) * TAU), y + r * Math.sin((i / n) * TAU)] as const);
}

/** The time of day a picture is lit for. */
export type TimeOfDay = 'day' | 'dusk' | 'night';

/** The light a picture is drawn in. */
export interface Env {
  time: TimeOfDay;
  night: boolean;
  dusk: boolean;
  /** Ambient light, multiplied into every colour by the light pass; white (in a light theme by day) means no light pass. */
  ambient: RGB;
  /** Drawn for a dark theme: dimmer ambient at every hour. */
  dark: boolean;
  /** Candles on the table are lit (an evening with people in). */
  candles: boolean;
  /** Milliseconds on the picture's clock, for scenes that move; 0 in a still. */
  t: number;
}

const AMBIENT: Record<TimeOfDay, { light: RGB; dark: RGB }> = {
  night: { light: [84, 82, 106], dark: [62, 60, 82] },
  dusk: { light: [212, 208, 216], dark: [96, 92, 112] },
  day: { light: [255, 255, 255], dark: [118, 112, 128] },
};

/** The light for a time of day, style and theme. A style may set its own night (a dark model needs more). */
export function envFor(time: TimeOfDay, style: Style, o: { dark?: boolean; candles?: boolean; t?: number } = {}): Env {
  const dark = !!o.dark;
  let ambient = dark ? AMBIENT[time].dark : AMBIENT[time].light;
  if (time === 'night' && style.ambient && !dark) ambient = style.ambient;
  return { time, night: time === 'night', dusk: time === 'dusk', ambient, dark, candles: !!o.candles, t: o.t ?? 0 };
}

/** A light's state in a scene: how bright (0 to 1) and in which colour (warm white when left out). */
export interface LightState {
  level: number;
  color?: RGB;
}

interface Light {
  p: [number, number];
  r: number;
  col: RGB;
  a: number;
  clip: Path2D | null;
}
interface Halo {
  p: [number, number];
  r: number;
  col: RGB;
  a: number;
}
interface Emit {
  p: Path2D;
  col: string;
}

export interface PrismOpts {
  /** The top's colour instead of the material's lit top. */
  top?: string;
  /** A soft highlight on the top: true for 0.4, or its strength. */
  soft?: boolean | number;
  /** No light top edges. */
  flat?: boolean;
  /** Strength of the light top edges (before the style's). */
  edge?: number;
}

export interface ShadowOpts {
  /** How high the thing is: the shadow falls further to the right. */
  h?: number;
  a?: number;
  blur?: number;
  z?: number;
  /** Corner radius (shadowR). */
  r?: number;
}

export interface LightOpts {
  r?: number;
  col?: RGB;
  a?: number;
  /** Where the light may fall; the room's clip when left out, `null` for anywhere. */
  clip?: Path2D | null;
  /** A little of a room's light spills over the cut walls; false keeps it in. */
  spill?: boolean;
}

/** The kit palette the shapes are drawn with; colours come from the scene, the theme's light from the light pass. */
const KITPAL: ClayPalette = {
  g: ['#FFFFFF', '#F7F5F2', '#EDEAE5', '#E0DBD3', '#CAC3B9', '#A39C92', '#77716A', '#4A4642', '#2A2725'],
  coral: '#E8705F',
  coralLight: '#F4A595',
  coralDeep: '#C24F3B',
  shade: '70,48,28',
  warm: '255,176,128',
  top: 0.3,
  side: 0.15,
  dark: false,
};

/** Shared by a stage and the stages it makes for other ground levels (a garden lower than the floor). */
interface Collected {
  lights: Light[];
  emits: Emit[];
  halos: Halo[];
  post: ((o: CanvasRenderingContext2D) => void)[];
  marks: Record<string, [number, number]>;
}

/** What a scene draws with: the projection, the shapes in the style's colours, the light and a back-to-front queue. */
export class Stage {
  readonly K: Clay;
  readonly c: CanvasRenderingContext2D;
  readonly s: number;
  /** The materials, by name. */
  readonly col: Colors;
  lights: Light[] = [];
  emits: Emit[] = [];
  halos: Halo[] = [];
  /** Drawn after the light pass, so they stay crisp: sound, steam, moving air. */
  post: ((o: CanvasRenderingContext2D) => void)[] = [];
  /** Screen positions of named things, rounded to pixels. */
  marks: Record<string, [number, number]> = {};
  /** Shadows stay on this floor. */
  floorClip: Path2D | null = null;
  /** Lights stay in this room. */
  roomClip: Path2D | null = null;
  /** Close-up mode: wall pieces hang in the air without the shadow they would cast on a wall. */
  bare = false;
  private items: { k: number; fn: () => void }[] = [];

  constructor(
    c: CanvasRenderingContext2D,
    readonly ox: number,
    readonly oy: number,
    s: number,
    readonly env: Env,
    readonly style: Style,
    colors: Colors,
    readonly dpr: number,
  ) {
    this.c = c;
    this.s = s;
    this.col = colors;
    this.K = new Clay(c, ox, oy, s, KITPAL);
  }

  /** A stage on the same canvas, lower by `dz` (a garden under the floor), sharing the light, post layer and marks. */
  lowered(dz: number): Stage {
    const g = new Stage(this.c, this.ox, this.oy + dz * this.s, this.s, this.env, this.style, this.col, this.dpr);
    g.share(this);
    g.bare = this.bare;
    return g;
  }

  /** Collect light, post drawings and marks into `from`'s lists. */
  share(from: Collected): void {
    this.lights = from.lights;
    this.emits = from.emits;
    this.halos = from.halos;
    this.post = from.post;
    this.marks = from.marks;
  }

  /** A colour in the style. */
  x(col: string): string {
    return this.style.xf(col);
  }

  /** A scene's paint (a material's name or a hex) as hex, before the style. */
  paint(p: Paint | undefined, fallback: string): string {
    if (!p) return fallback;
    if (p.startsWith('#')) return p;
    return p in this.col ? this.col[p as keyof Colors] : fallback;
  }

  /** A line width that follows the scale. */
  lw(k: number): number {
    return Math.max(0.6, (k * this.s) / 40);
  }

  /** A lamp's level and colour in the style: some styles warm lamp colours, a dark style brightens them. */
  lamp(l: LightState | undefined): [number, RGB] {
    if (!l || !l.level) return [0, WARM];
    const k = this.style.lightTint;
    const col = l.color ?? WARM;
    return [Math.min(1, l.level * this.style.glowBoost), col.map((c, i) => Math.round(c + (WARM[i] - c) * k)) as unknown as RGB];
  }

  P(x: number, y: number, z = 0): [number, number] {
    return this.K.p(x, y, z);
  }

  path(pts: readonly (readonly number[])[]): Path2D {
    const p = new Path2D();
    pts.forEach((q, i) => {
      const [a, b] = this.P(q[0], q[1], q[2] ?? 0);
      if (i) p.lineTo(a, b);
      else p.moveTo(a, b);
    });
    p.closePath();
    return p;
  }

  /** Fills a polygon (or a path) with a colour in the style, closing the seams between neighbours with a thin stroke. */
  fill(pts: readonly Point3[] | Path2D, col: string | CanvasGradient, seam = true): Path2D {
    const fillCol = typeof col === 'string' ? this.x(col) : col;
    const p = pts instanceof Path2D ? pts : this.path(pts);
    const c = this.c;
    c.fillStyle = fillCol;
    c.fill(p);
    if (seam && typeof fillCol === 'string') {
      c.strokeStyle = fillCol;
      c.lineWidth = 0.7;
      c.lineJoin = 'round';
      c.stroke(p);
    }
    return p;
  }

  /** The soft shadow a wall piece casts on its wall; none in close-up mode. */
  wallShadow(pts: readonly Point3[], a: number): void {
    if (this.bare) return;
    this.fill(pts, `rgba(70,48,28,${a})`, false);
  }

  line(a: Point3, b: Point3, col: string, w = 1, alpha = 1): void {
    this.pline([a, b], col, w, alpha);
  }

  pline(pts: readonly Point3[], col: string, w = 1, alpha = 1): void {
    const c = this.c;
    c.save();
    c.globalAlpha = alpha;
    c.beginPath();
    pts.forEach((q, i) => {
      const [a, b] = this.P(q[0], q[1], q[2]);
      if (i) c.lineTo(a, b);
      else c.moveTo(a, b);
    });
    c.strokeStyle = this.x(col);
    c.lineWidth = w;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.stroke();
    c.restore();
  }

  /** The faces of a base colour in the style (or a ready material, each face in the style). */
  M(col: string | Material): Material {
    if (typeof col !== 'string') return { t: this.x(col.t), l: this.x(col.l), r: this.x(col.r), e: this.x(col.e) };
    const b = this.x(col);
    return { t: lt(b, 0.3), l: b, r: dk(b, 0.15), e: lt(b, 0.6) };
  }

  box(x: number, y: number, z: number, w: number, d: number, h: number, col: string | Material, o: { flat?: boolean } = {}): void {
    this.K.box(x, y, z, w, d, h, this.M(col), o);
  }

  cyl(x: number, y: number, z: number, r: number, h: number, col: string | Material, o: { open?: boolean; topFill?: string } = {}): void {
    this.K.cyl(x, y, z, r, h, this.M(col), o);
  }

  sph(x: number, y: number, z: number, r: number, col: string): [number, number, number] {
    return this.K.sphere(x, y, z, r, this.M(col));
  }

  disc(x: number, y: number, z: number, r: number, col: string): void {
    this.K.disc(x, y, z, r, this.x(col));
  }

  ring(x: number, y: number, z: number, r: number, col: string, w = 1, a = 1): void {
    this.K.ring(x, y, z, r, this.x(col), w, a);
  }

  /** An upright prism on a convex plan: the faces turned to the viewer, shaded by where they face, then the top. */
  prism(pts: readonly Pt2[], z: number, h: number, col: string | Material, o: PrismOpts = {}): void {
    const m = this.M(col);
    const c = this.c;
    const n = pts.length;
    let cx = 0;
    let cy = 0;
    pts.forEach((p) => {
      cx += p[0];
      cy += p[1];
    });
    cx /= n;
    cy /= n;
    const faces: { a: Pt2; b: Pt2; nx: number; ny: number; k: number }[] = [];
    for (let i = 0; i < n; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % n];
      let nx = b[1] - a[1];
      let ny = -(b[0] - a[0]);
      const mx = (a[0] + b[0]) / 2;
      const my = (a[1] + b[1]) / 2;
      if (nx * (mx - cx) + ny * (my - cy) < 0) {
        nx = -nx;
        ny = -ny;
      }
      const L = Math.hypot(nx, ny) || 1;
      nx /= L;
      ny /= L;
      if (nx + ny > 0.03) faces.push({ a, b, nx, ny, k: mx + my });
    }
    faces.sort((p, q) => p.k - q.k);
    if (h > 0) {
      for (const f of faces) {
        const w = Math.atan2(f.nx, f.ny) / (Math.PI / 2);
        const base = w < 0 ? mix(m.l, m.t, Math.min(1, -w) * 0.45) : w > 1 ? dk(m.r, Math.min(1, w - 1) * 0.14) : mix(m.l, m.r, w);
        const quad: Point3[] = [
          [f.a[0], f.a[1], z],
          [f.b[0], f.b[1], z],
          [f.b[0], f.b[1], z + h],
          [f.a[0], f.a[1], z + h],
        ];
        this.fill(quad, this.K.grad([f.a[0], f.a[1], z + h], [f.a[0], f.a[1], z], base, dk(base, 0.07)), false);
        c.strokeStyle = base;
        c.lineWidth = 0.6;
        c.stroke(this.path(quad));
      }
    }
    this.fill(
      pts.map((p) => [p[0], p[1], z + h] as const),
      o.top ?? m.t,
    );
    if (o.soft) this.softTop(pts, z + h, '#FFFFFF', o.soft === true ? 0.4 : o.soft);
    if (!o.flat && h > 0 && faces.length) {
      c.save();
      c.beginPath();
      faces.forEach((f) => {
        c.moveTo(...this.P(f.a[0], f.a[1], z + h));
        c.lineTo(...this.P(f.b[0], f.b[1], z + h));
      });
      c.strokeStyle = m.e;
      c.lineWidth = 1;
      c.lineCap = 'round';
      c.globalAlpha = (o.edge ?? 0.75) * this.style.edge;
      c.stroke();
      c.restore();
    }
  }

  /** A box with rounded corners in plan; the style decides how round. */
  rbox(x: number, y: number, z: number, w: number, d: number, h: number, r: number, col: string | Material, o: PrismOpts & { n?: number } = {}): void {
    this.prism(rr(x, y, w, d, r * this.style.round, o.n ?? 4), z, h, col, o);
  }

  /** A soft highlight in the middle of a top face, so it reads as plump. */
  softTop(pts: readonly Pt2[], z: number, col = '#FFFFFF', a = 0.4): void {
    const c = this.c;
    const sp = pts.map((q) => this.P(q[0], q[1], z));
    let cx = 0;
    let cy = 0;
    let R = 0;
    sp.forEach((q) => {
      cx += q[0];
      cy += q[1];
    });
    cx /= sp.length;
    cy /= sp.length;
    sp.forEach((q) => (R = Math.max(R, Math.hypot(q[0] - cx, q[1] - cy))));
    c.save();
    c.clip(this.path(pts.map((q) => [q[0], q[1], z] as const)));
    const g = c.createRadialGradient(cx - R * 0.12, cy - R * 0.18, 0, cx, cy, R);
    g.addColorStop(0, rgba(col, a));
    g.addColorStop(1, rgba(col, 0));
    c.fillStyle = g;
    c.fillRect(cx - R, cy - R, R * 2, R * 2);
    c.restore();
  }

  /** A truncated cone standing on (x, y, z): r0 at the bottom, r1 at the top. */
  cone(x: number, y: number, z: number, r0: number, r1: number, h: number, col: string, o: { topFill?: string } = {}): void {
    const m = this.M(col);
    const c = this.c;
    const [cx, cy, rx0, ry0] = this.K.ell(x, y, z, r0);
    const [, ty, rx1, ry1] = this.K.ell(x, y, z + h, Math.max(r1, 0.0001));
    const R = Math.max(rx0, rx1);
    const g = c.createLinearGradient(cx - R, 0, cx + R, 0);
    g.addColorStop(0, m.l);
    g.addColorStop(0.55, mix(m.l, m.r, 0.45));
    g.addColorStop(1, m.r);
    c.beginPath();
    c.moveTo(cx - rx1, ty);
    c.lineTo(cx - rx0, cy);
    c.ellipse(cx, cy, rx0, ry0, 0, Math.PI, 0, true);
    c.lineTo(cx + rx1, ty);
    c.ellipse(cx, ty, rx1, ry1, 0, 0, Math.PI, false);
    c.closePath();
    c.fillStyle = g;
    c.fill();
    if (r1 > 0.002) {
      c.beginPath();
      c.ellipse(cx, ty, rx1, ry1, 0, 0, TAU);
      c.fillStyle = o.topFill ?? m.t;
      c.fill();
    }
  }

  /** A soft shadow of a footprint on the floor, falling to the right (the light comes from the left). */
  shadow(pts: readonly Pt2[], o: ShadowOpts = {}): void {
    const c = this.c;
    const h = o.h ?? 0.4;
    const off = h * 0.32;
    c.save();
    if (this.floorClip) c.clip(this.floorClip);
    c.filter = `blur(${Math.max(1.5, (o.blur ?? 0.09) * this.s * this.dpr)}px)`;
    c.fillStyle = `rgba(74,50,30,${(o.a ?? 0.2) * (this.env.dark ? 1.6 : 1)})`;
    c.fill(this.path(pts.map((p) => [p[0] + off * 0.75 + 0.02, p[1] - off * 0.55 + 0.02, (o.z ?? 0) + 0.004] as const)));
    c.restore();
  }

  shadowR(x: number, y: number, w: number, d: number, o: ShadowOpts = {}): void {
    this.shadow(rr(x, y, w, d, o.r ?? 0.08), o);
  }

  shadowC(x: number, y: number, r: number, o: ShadowOpts = {}): void {
    this.shadow(circ(x, y, r, 14), o);
  }

  /** A flat piece on the back wall y = at, between x0 and x1. */
  wy(x0: number, x1: number, z0: number, z1: number, col: string, at = 0.012): void {
    this.fill([[x0, at, z0], [x1, at, z0], [x1, at, z1], [x0, at, z1]], col);
  }

  /** A flat piece on the back wall x = at, between y0 and y1. */
  wx(y0: number, y1: number, z0: number, z1: number, col: string, at = 0.012): void {
    this.fill([[at, y0, z0], [at, y1, z0], [at, y1, z1], [at, y0, z1]], col);
  }

  /** A pool of light for the light pass, held inside its room; a little of it spills over the cut walls. */
  light(x: number, y: number, z: number, o: LightOpts = {}): void {
    const q: Light = { p: this.P(x, y, z), r: (o.r ?? 2.2) * this.s, col: o.col ?? [255, 190, 135], a: o.a ?? 1, clip: o.clip === undefined ? this.roomClip : o.clip };
    this.lights.push(q);
    if (q.clip && o.spill !== false) this.lights.push({ p: q.p, r: q.r * 0.72, col: q.col, a: q.a * 0.3, clip: null });
  }

  /** A glow added on top after the light pass. */
  halo(x: number, y: number, z: number, r: number, col: RGB = [255, 200, 150], a = 0.5): void {
    this.halos.push({ p: this.P(x, y, z), r: r * this.s, col, a });
  }

  /** Where something gives its own light: the light pass leaves it at full colour. */
  emit(p: Path2D | readonly Point3[], col = '#FFFFFF'): void {
    this.emits.push({ p: p instanceof Path2D ? p : this.path(p), col });
  }

  emitC(x: number, y: number, z: number, r: number, col = '#FFFFFF'): void {
    const [a, b] = this.P(x, y, z);
    const p = new Path2D();
    p.arc(a, b, r * this.s, 0, TAU);
    this.emits.push({ p, col });
  }

  /** Queues a thing at its plan position (plus a bias); flush draws the queue back to front. */
  add(x: number, y: number, fn: () => void, bias = 0): void {
    this.items.push({ k: x + y + bias, fn });
  }

  /** Draws the queue back to front; things queued while drawing follow in a later round. */
  flush(): void {
    while (this.items.length) {
      const batch = this.items;
      this.items = [];
      batch.sort((a, b) => a.k - b.k).forEach((it) => it.fn());
    }
  }

  /** Records where a named thing is on the screen. */
  mark(name: string, x: number, y: number, z = 0): void {
    const [a, b] = this.P(x, y, z);
    this.marks[name] = [Math.round(a), Math.round(b)];
  }
}
