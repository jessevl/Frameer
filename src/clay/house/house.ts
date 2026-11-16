/**
 * @file house.ts
 * @description A house picture from a plain model: floors of rooms (each with a floor kind, a wall paint, openings in its cut walls, the pieces on its back walls and its items with their live state), drawn as a cut-away dollhouse on a plinth: the two back walls painted per room with a skirting board, low cut partitions, low cut front walls with glass where there is a window or a garden door, and things back to front, room by room, each room's light held inside it. Floors stack with an offset; one room can be drawn alone (`only`); the first floor can stand in its plot (lawn, drive, terrace, garden things); a room can be selected (a coral outline, with corner handles for a builder) over a dotted grid. The picture goes through the light pass, the grain and gets the soft shadow it rests on, and reports anchors (`marks`) for callouts.
 * Ported from hearth-concept/clay2/house.js (floorFill, drawFloor, the plot, picture); the reference home's rooms and states are data in examples/home.ts.
 * Used by: scene.ts (renderHouse), HousePicture, the examples and tests.
 */
import { colorsFor, dk, lt, type Colors, type Paint } from './colors';
import { placeItems, type Item } from './items';
import { domCanvas, grade, grain, needsLightPass, postOnly, type CanvasMaker } from './light';
import { C30, Stage, TAU, envFor, hsh, rr, type Pt2, type TimeOfDay } from './stage';
import { DEFAULT_STYLE, makeStyle, type Style, type StyleName } from './styles';
import { mix } from '../../icons/palette';
import type { ClayPalette } from '../clay';

/** Wall height, wall thickness, height of the cut partitions. */
export const WALL_H = 1.42;
export const WALL_T = 0.14;
export const PART_H = 0.5;

/** A named point to report on the screen. */
export interface Mark {
  name: string;
  x: number;
  y: number;
  z?: number;
}

export type FloorKind = 'wood' | 'tile' | 'bath' | 'concrete';

/** One room: a rectangle of a floor. Rooms on the back edges (x = 0 or y = 0) get the back walls' pieces. */
export interface HouseRoom {
  id: string;
  x: number;
  y: number;
  w: number;
  d: number;
  floor: FloorKind;
  /** The back walls' paint in this room. */
  wall?: Paint;
  /** An opening in the cut wall on its left side (x = this.x), from y to y. */
  gapX?: readonly [number, number];
  /** An opening in the cut wall on its back side (y = this.y), from x to x. */
  gapY?: readonly [number, number];
  /** Boxes [x, y, w, d, h] that stand above the cut walls, so the room's light still reaches their faces. */
  tall?: readonly (readonly [number, number, number, number, number])[];
  /** Pieces on the back walls (windows, frames, a TV on the wall is an item). */
  walls?: readonly Item[];
  items?: readonly Item[];
  marks?: readonly Mark[];
}

/** A stretch of a front edge: a low wall, glass (a window or a garden door) or an opening. */
export type FrontEdge = readonly [number, number, 'wall' | 'glass' | 'door'];

export interface HouseFloor {
  id: string;
  /** Size along x and y. */
  w: number;
  d: number;
  rooms: readonly HouseRoom[];
  /** The cut front walls: along the edge x = w (`x`, by y) and y = d (`y`, by x). */
  front?: { x: readonly FrontEdge[]; y: readonly FrontEdge[] };
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  d: number;
  r?: number;
}

/** The ground around the first floor, 0.3 below it. */
export interface Plot {
  lawn: Rect;
  drive?: Rect;
  deck?: Rect;
  stones?: readonly Rect[];
  /** Behind the house (drawn before it). */
  behind?: readonly Item[];
  /** In front of it. */
  front?: readonly Item[];
  marks?: readonly Mark[];
}

export interface HouseScene {
  floors: readonly HouseFloor[];
  /** The floors to draw, bottom first; all by default. */
  show?: readonly string[];
  /** One room alone, close to. */
  only?: string;
  /** The plot, around the lowest floor shown. */
  plot?: Plot;
  /** Each next floor shifted by this much (right, up), in scene units. */
  step?: readonly [number, number];
  /** A room outlined in coral; `handles` adds corner handles, `grid` a dotted grid around the floor. */
  selected?: string;
  handles?: boolean;
  grid?: boolean;
  /** Candles on tables are lit (dusk or night only). */
  candles?: boolean;
}

/** How a picture is drawn. */
export interface PictureOptions {
  style?: StyleName;
  time?: TimeOfDay;
  /** Drawn for a dark theme. */
  dark?: boolean;
  /** The theme's clay palette: coral comes from it. */
  palette?: Pick<ClayPalette, 'coral' | 'coralLight' | 'coralDeep'>;
  /** Pixels per scene unit; with `fit`, the largest scale that fits. */
  s?: number;
  /** A box in CSS pixels to fit the picture in, centred. */
  fit?: { w: number; h: number };
  /** Padding in CSS pixels. */
  pad?: number;
  /** Device pixels per CSS pixel; 2 by default. */
  dpr?: number;
  /** The picture's clock in ms, for scenes that move. */
  t?: number;
  canvas?: CanvasMaker;
}

/** A drawn picture: the canvas (device pixels), its size in CSS pixels, the scale and where named things are. */
export interface Picture {
  canvas: HTMLCanvasElement;
  w: number;
  h: number;
  s: number;
  marks: Record<string, [number, number]>;
}

const WOOD_FLOORS: Record<FloorKind, (C: Colors, st: Stage) => string> = {
  wood: (C) => C.wood,
  tile: (C, st) => (st.style.plain ? mix(C.tile, C.wood, 0.25) : C.tile),
  bath: (_C, st) => st.x('#DFE6E8'),
  concrete: (C) => C.concrete,
};

function floorFill(st: Stage, r: HouseRoom): void {
  const C = st.col;
  const c = st.c;
  const { x, y, w, d } = r;
  const pts = [
    [x, y, 0],
    [x + w, y, 0],
    [x + w, y + d, 0],
    [x, y + d, 0],
  ] as const;
  const base = WOOD_FLOORS[r.floor](C, st);
  st.fill(pts, base);
  c.save();
  c.clip(st.path(pts));
  const fine = Math.max(0.6, st.s / 60);
  if (st.style.plain) {
    // Plain floors: no planks or tiles.
  } else if (r.floor === 'wood') {
    let j = 0;
    for (let yy = y; yy < y + d; yy += 0.31, j++) {
      let xx = x - hsh(j * 3.7 + y) * 1.4;
      let i = 0;
      while (xx < x + w) {
        const len = 1.3 + hsh(j * 5.1 + i * 2.3) * 0.7;
        st.fill([[xx, yy, 0], [xx + len, yy, 0], [xx + len, yy + 0.31, 0], [xx, yy + 0.31, 0]], mix(base, hsh(i * 7.3 + j * 1.9) > 0.5 ? C.woodDeep : '#FFFFFF', hsh(i * 3.1 + j * 9.7) * 0.2), false);
        st.line([xx + len, yy, 0], [xx + len, yy + 0.31, 0], dk(base, 0.16), Math.max(0.5, st.s / 70), 0.5);
        xx += len;
        i++;
      }
      st.line([x, yy, 0], [x + w, yy, 0], dk(base, 0.16), Math.max(0.5, st.s / 70), 0.5);
    }
  } else if (r.floor === 'tile') {
    const t = 0.52;
    let i = 0;
    for (let xx = x; xx < x + w; xx += t, i++) {
      let j = 0;
      for (let yy = y; yy < y + d; yy += t, j++) if ((i + j) % 2) st.fill([[xx, yy, 0], [xx + t, yy, 0], [xx + t, yy + t, 0], [xx, yy + t, 0]], dk(base, 0.045), false);
    }
    for (let xx = x; xx < x + w; xx += t) st.line([xx, y, 0], [xx, y + d, 0], C.grout, fine, 0.9);
    for (let yy = y; yy < y + d; yy += t) st.line([x, yy, 0], [x + w, yy, 0], C.grout, fine, 0.9);
  } else if (r.floor === 'bath') {
    const t = 0.3;
    for (let xx = x; xx < x + w; xx += t) st.line([xx, y, 0], [xx, y + d, 0], '#F5F8F9', fine, 0.9);
    for (let yy = y; yy < y + d; yy += t) st.line([x, yy, 0], [x + w, yy, 0], '#F5F8F9', fine, 0.9);
  } else {
    for (let i = 0; i < 40; i++) {
      const [a, b] = st.P(x + hsh(i * 1.3 + x) * w, y + hsh(i * 2.9 + y) * d, 0);
      c.beginPath();
      c.arc(a, b, Math.max(0.5, st.s / 80), 0, TAU);
      c.fillStyle = 'rgba(120,112,104,.25)';
      c.fill();
    }
  }
  // A little darker toward the back walls.
  if (r.y < 0.01) {
    c.fillStyle = st.K.grad([x, y, 0], [x, y + 0.7, 0], 'rgba(74,50,30,.16)', 'rgba(74,50,30,0)');
    c.fill(st.path([[x, y, 0], [x + w, y, 0], [x + w, y + 0.7, 0], [x, y + 0.7, 0]]));
  }
  if (r.x < 0.01) {
    c.fillStyle = st.K.grad([x, y, 0], [x + 0.7, y, 0], 'rgba(74,50,30,.16)', 'rgba(74,50,30,0)');
    c.fill(st.path([[x, y, 0], [x + 0.7, y, 0], [x + 0.7, y + d, 0], [x, y + d, 0]]));
  }
  c.restore();
}

const boxHex = (x: number, y: number, w: number, d: number, h: number) =>
  [
    [x + w, y + d, 0],
    [x + w, y, 0],
    [x + w, y, h],
    [x, y, h],
    [x, y + d, h],
    [x, y + d, 0],
  ] as const;

/** What a room's light may reach: the room up to its walls' height, and the tall things in it. */
function roomClip(st: Stage, r: HouseRoom, all: boolean): Path2D {
  const hy = all || r.y < 0.01 ? WALL_H + 0.1 : PART_H + 0.02;
  const hx = all || r.x < 0.01 ? WALL_H + 0.1 : PART_H + 0.02;
  const p = new Path2D();
  p.addPath(
    st.path([
      [r.x + r.w, r.y + r.d, 0],
      [r.x + r.w, r.y, 0],
      [r.x + r.w, r.y, hy],
      [r.x, r.y, Math.max(hx, hy)],
      [r.x, r.y + r.d, hx],
      [r.x, r.y + r.d, 0],
    ]),
  );
  for (const b of r.tall ?? []) p.addPath(st.path(boxHex(b[0], b[1], b[2], b[3], b[4])));
  return p;
}

function markAll(st: Stage, marks: readonly Mark[] | undefined): void {
  for (const m of marks ?? []) st.mark(m.name, m.x, m.y, m.z ?? 0);
}

/** The ground of the plot, 0.3 below the floor: lawn, drive, terrace and stepping stones. */
function plotGround(st: Stage, p: Plot): void {
  const C = st.col;
  const c = st.c;
  const L = p.lawn;
  const lawn = rr(L.x, L.y, L.w, L.d, L.r ?? 0.6, 6);
  st.prism(lawn, -0.46, 0.16, C.lawnDeep, { top: C.lawn, edge: 0.3 });
  c.save();
  c.clip(st.path(lawn.map((q) => [q[0], q[1], -0.3])));
  for (let i = Math.floor(L.x) - 7; i < L.x + L.w + 9; i += 2) st.fill([[i, L.y - 0.4, -0.3], [i + 1, L.y - 0.4, -0.3], [i + 1 - 9, L.y + 9.6, -0.3], [i - 9, L.y + 9.6, -0.3]], 'rgba(255,255,255,.06)', false);
  c.restore();
  const thin = Math.max(0.5, st.s / 70);
  if (p.drive) {
    const D = p.drive;
    st.fill(rr(D.x, D.y, D.w, D.d, D.r ?? 0.12).map((q) => [q[0], q[1], -0.298] as const), C.paver);
    for (let y = D.y + 0.4; y < D.y + D.d - 0.05; y += 0.42) st.line([D.x + 0.02, y, -0.297], [D.x + D.w - 0.02, y, -0.297], dk(C.paver, 0.08), thin, 0.8);
    for (let x = D.x + 0.42; x < D.x + D.w - 0.1; x += 0.42) st.line([x, D.y + 0.02, -0.297], [x, D.y + D.d - 0.02, -0.297], dk(C.paver, 0.08), thin, 0.8);
  }
  if (p.deck) {
    const K = p.deck;
    st.fill(rr(K.x, K.y, K.w, K.d, K.r ?? 0.06).map((q) => [q[0], q[1], -0.296] as const), C.woodDeep);
    for (let y = K.y; y < K.y + K.d; y += 0.14) st.line([K.x, y, -0.295], [K.x + K.w, y, -0.295], dk(C.woodDeep, 0.12), thin, 0.7);
  }
  for (const s of p.stones ?? []) st.fill(rr(s.x, s.y, s.w, s.d, s.r ?? 0.08).map((q) => [q[0], q[1], -0.296] as const), C.paver);
}

function drawFloor(st: Stage, floor: HouseFloor, scene: HouseScene, plot: Plot | null): void {
  const C = st.col;
  const c = st.c;
  const only = scene.only ? (floor.rooms.find((r) => r.id === scene.only) ?? null) : null;
  const rooms = (only ? [only] : floor.rooms).slice().sort((a, b) => a.x + a.y - (b.x + b.y));
  const X0 = only ? only.x : 0;
  const Y0 = only ? only.y : 0;
  const FW = only ? only.w : floor.w;
  const FD = only ? only.d : floor.d;
  const X1 = X0 + FW;
  const Y1 = Y0 + FD;
  const TH = WALL_T;
  const WH = WALL_H;
  if (plot) {
    plotGround(st, plot);
    const g = st.lowered(0.3);
    placeItems(g, plot.behind ?? []);
    g.flush();
  }
  st.prism(rr(X0 - TH - 0.08, Y0 - TH - 0.08, FW + TH + 0.16, FD + TH + 0.16, 0.1), -0.3, 0.3, C.plinth, { edge: 0.5 });
  st.floorClip = st.path([
    [X0, Y0, 0],
    [X1, Y0, 0],
    [X1, Y1, 0],
    [X0, Y1, 0],
  ]);
  for (const r of rooms) floorFill(st, r);
  // The two back walls, painted per room, with a skirting board.
  const wallM = { t: C.cut, l: C.wall, r: dk(C.wall, 0.1), e: '#FFFFFF' };
  st.box(X0 - TH, Y0 - TH, 0, FW + TH, TH, WH, wallM);
  st.box(X0 - TH, Y0, 0, TH, FD, WH, wallM);
  for (const r of rooms) {
    const col = st.x(st.paint(r.wall, C.wall));
    if (only || r.y < 0.01) {
      const y = Y0 + 0.004;
      st.fill([[r.x, y, 0], [r.x + r.w, y, 0], [r.x + r.w, y, WH], [r.x, y, WH]], st.K.grad([r.x, y, WH], [r.x, y, 0], lt(col, 0.1), dk(col, 0.05)), false);
      st.fill([[r.x, y + 0.004, 0], [r.x + r.w, y + 0.004, 0], [r.x + r.w, y + 0.004, 0.07], [r.x, y + 0.004, 0.07]], C.cut);
    }
    if (only || r.x < 0.01) {
      const cx = dk(col, 0.085);
      const x = X0 + 0.004;
      st.fill([[x, r.y, 0], [x, r.y + r.d, 0], [x, r.y + r.d, WH], [x, r.y, WH]], st.K.grad([x, r.y, WH], [x, r.y, 0], lt(cx, 0.08), dk(cx, 0.05)), false);
      st.fill([[x + 0.004, r.y, 0], [x + 0.004, r.y + r.d, 0], [x + 0.004, r.y + r.d, 0.07], [x + 0.004, r.y, 0.07]], dk(C.cut, 0.06));
    }
  }
  // Where the two walls meet, a soft crease.
  st.line([X0 + 0.006, Y0 + 0.006, 0], [X0 + 0.006, Y0 + 0.006, WH], 'rgba(74,50,30,.22)', Math.max(1, st.s / 28));
  for (const r of rooms) {
    st.roomClip = roomClip(st, r, !!only);
    if (r.x < 0.01 || r.y < 0.01) placeItems(st, r.walls ?? []);
  }
  // Rooms back to front: the cut partitions on their far sides, then their things.
  const part = { t: C.cut, l: C.wall, r: dk(C.wall, 0.1), e: '#FFFFFF' };
  for (const r of rooms) {
    st.roomClip = roomClip(st, r, !!only);
    if (!only && r.x > 0.01) {
      const g = r.gapX;
      if (g) {
        if (g[0] > r.y + 0.02) st.box(r.x - 0.05, r.y, 0, 0.1, g[0] - r.y, PART_H, part);
        if (g[1] < r.y + r.d - 0.02) st.box(r.x - 0.05, g[1], 0, 0.1, r.y + r.d - g[1], PART_H, part);
      } else st.box(r.x - 0.05, r.y, 0, 0.1, r.d, PART_H, part);
    }
    if (!only && r.y > 0.01) {
      const g = r.gapY;
      if (g) {
        if (g[0] > r.x + 0.02) st.box(r.x, r.y - 0.05, 0, g[0] - r.x, 0.1, PART_H, part);
        if (g[1] < r.x + r.w - 0.02) st.box(g[1], r.y - 0.05, 0, r.x + r.w - g[1], 0.1, PART_H, part);
      } else st.box(r.x, r.y - 0.05, 0, r.w, 0.1, PART_H, part);
    }
    placeItems(st, r.items ?? []);
    markAll(st, r.marks);
    st.flush();
    st.mark('room:' + r.id, r.x + r.w / 2, r.y + r.d / 2, 0);
  }
  st.roomClip = null;
  // The cut front walls.
  const W = floor.w;
  const D = floor.d;
  if (!only) {
    const h = 0.2;
    const glassM = { t: 'rgba(255,255,255,.9)', l: 'rgba(196,224,236,.5)', r: 'rgba(176,208,224,.5)', e: '#FFFFFF' };
    const fr = floor.front ?? { x: [[0, D, 'wall']] as FrontEdge[], y: [[0, W, 'wall']] as FrontEdge[] };
    for (const [a, b, kind] of fr.x) {
      if (kind === 'wall') st.box(W, a, 0, TH, b - a, h, part);
      else if (kind === 'glass') {
        st.box(W + 0.05, a, 0, 0.035, b - a, h + 0.16, glassM);
        st.box(W, a, 0, TH, 0.05, h + 0.18, part);
        st.box(W, b - 0.05, 0, TH, 0.05, h + 0.18, part);
      }
    }
    st.box(W, D, 0, TH, TH, h, part);
    for (const [a, b, kind] of fr.y) {
      if (kind === 'wall') st.box(a, D, 0, b - a, TH, h, part);
      else if (kind === 'glass') {
        st.box(a, D + 0.05, 0, b - a, 0.035, h + 0.16, glassM);
        st.box(a, D, 0, 0.05, TH, h + 0.18, part);
        st.box(b - 0.05, D, 0, 0.05, TH, h + 0.18, part);
      }
    }
  } else {
    st.box(X1, Y0, 0, TH, FD + TH, 0.2, part);
    st.box(X0, Y1, 0, FW, TH, 0.2, part);
  }
  const sel = scene.selected ? floor.rooms.find((q) => q.id === scene.selected) : undefined;
  if (sel) {
    const r = sel;
    c.save();
    c.strokeStyle = C.coral;
    c.lineWidth = 3;
    c.lineJoin = 'round';
    c.stroke(
      st.path([
        [r.x, r.y, 0.02],
        [r.x + r.w, r.y, 0.02],
        [r.x + r.w, r.y + r.d, 0.02],
        [r.x, r.y + r.d, 0.02],
      ]),
    );
    if (scene.handles)
      for (const [a, b] of [
        [r.x, r.y],
        [r.x + r.w, r.y],
        [r.x + r.w, r.y + r.d],
        [r.x, r.y + r.d],
      ]) {
        const [hx, hy] = st.P(a, b, 0.02);
        c.beginPath();
        c.arc(hx, hy, 6.5, 0, TAU);
        c.fillStyle = '#fff';
        c.fill();
        c.lineWidth = 2.5;
        c.stroke();
      }
    c.restore();
    st.mark('selEx', r.x + r.w, r.y + r.d / 2, 0);
    st.mark('selNx', r.x + r.w / 2, r.y, 0);
  }
  if (plot) {
    const g = st.lowered(0.3);
    placeItems(g, plot.front ?? []);
    markAll(g, plot.marks);
    g.flush();
  }
}

interface Shown {
  floors: HouseFloor[];
  /** The area drawn of each floor (a room alone, or the whole floor). */
  area: { x: number; y: number; w: number; d: number };
}

function shown(scene: HouseScene): Shown {
  const floors = scene.show ? scene.show.map((id) => scene.floors.find((f) => f.id === id)).filter((f): f is HouseFloor => !!f) : scene.floors.slice();
  const only = scene.only ? floors.flatMap((f) => f.rooms).find((r) => r.id === scene.only) : undefined;
  const f0 = floors[0];
  const area = only ? { x: only.x, y: only.y, w: only.w, d: only.d } : { x: 0, y: 0, w: f0?.w ?? 1, d: f0?.d ?? 1 };
  return { floors, area };
}

/** The picture's extent at scale 1, without padding: left, right, top, bottom (screen units around the origin). */
export function houseExtent(scene: HouseScene): { l: number; r: number; t: number; b: number } {
  const { floors, area } = shown(scene);
  const step = scene.step ?? [0, 0];
  let l = 1e9;
  let r = -1e9;
  let t = 1e9;
  let b = -1e9;
  floors.forEach((f, i) => {
    const pl = !!scene.plot && i === 0 && !scene.only;
    const L = scene.plot?.lawn;
    const x0 = pl && L ? L.x - 0.1 : -0.3;
    const y0 = pl && L ? L.y - 0.1 : -0.3;
    const x1 = pl && L ? L.x + L.w + 0.1 : (scene.only ? area.w : f.w) + 0.3;
    const y1 = pl && L ? L.y + L.d + 0.1 : (scene.only ? area.d : f.d) + 0.3;
    const e = { l: (x0 - y1) * C30, r: (x1 - y0) * C30, t: (x0 + y0) / 2 - WALL_H - 0.1, b: (x1 + y1) / 2 + (pl ? 0.5 : 0.36) };
    l = Math.min(l, e.l + i * step[0]);
    r = Math.max(r, e.r + i * step[0]);
    t = Math.min(t, e.t - i * step[1]);
    b = Math.max(b, e.b - i * step[1]);
  });
  return { l, r, t, b };
}

/** Draws a house picture. */
export function drawHouse(scene: HouseScene, o: PictureOptions = {}): Picture {
  const colors = colorsFor(o.palette);
  const style: Style = makeStyle(o.style ?? DEFAULT_STYLE, colors);
  const time = o.time ?? 'day';
  const env = envFor(time, style, { dark: o.dark, candles: !!scene.candles && time !== 'day', t: o.t });
  const dpr = o.dpr ?? 2;
  const make = o.canvas ?? domCanvas;
  const pad = o.pad ?? 14;
  const ext = houseExtent(scene);
  const g = scene.grid ? 1.1 : 0;
  let s = o.s ?? 30;
  if (o.fit) s = Math.max(0.01, Math.min((o.fit.w - pad * 2) / (ext.r - ext.l + g * 2), (o.fit.h - pad * 2) / (ext.b - ext.t + g)));
  const wpx = o.fit ? o.fit.w : Math.ceil((ext.r - ext.l) * s + pad * 2 + g * s * 2);
  const hpx = o.fit ? o.fit.h : Math.ceil((ext.b - ext.t) * s + pad * 2 + g * s);
  const cv = make(Math.round(wpx * dpr), Math.round(hpx * dpr));
  const c = cv.getContext('2d');
  if (!c) return { canvas: cv, w: wpx, h: hpx, s, marks: {} };
  c.scale(dpr, dpr);
  // Centred in a fitted box; otherwise padded from the top left.
  const spareX = o.fit ? (wpx - (ext.r - ext.l + g * 2) * s - pad * 2) / 2 : 0;
  const spareY = o.fit ? (hpx - (ext.b - ext.t + g) * s - pad * 2) / 2 : 0;
  const ox = pad + g * s - ext.l * s + spareX;
  const oy = pad + g * s * 0.5 - ext.t * s + spareY;
  const { floors, area } = shown(scene);
  const step = scene.step ?? [0, 0];
  const shadows: Path2D[] = [];
  let first: Stage | null = null;
  floors.forEach((floor, i) => {
    const st = new Stage(c, ox + i * step[0] * s - (area.x - area.y) * C30 * s, oy - i * step[1] * s - ((area.x + area.y) / 2) * s, s, env, style, colors, dpr);
    if (first) st.share(first);
    else first = st;
    if (scene.grid)
      for (let x = -1.5; x <= floor.w + 1.5; x += 0.5)
        for (let y = -1.5; y <= floor.d + 1.5; y += 0.5) {
          if (x >= -0.3 && x <= floor.w + 0.3 && y >= -0.3 && y <= floor.d + 0.3) continue;
          const [gx, gy] = st.P(x, y, -0.3);
          c.beginPath();
          c.arc(gx, gy, 1.3, 0, TAU);
          c.fillStyle = '#CAC3B9';
          c.fill();
        }
    const plot = scene.plot && i === 0 && !scene.only ? scene.plot : null;
    drawFloor(st, floor, scene, plot);
    st.mark('floor:' + floor.id, area.x, area.y + area.d, 0);
    const base: Pt2[] = plot ? rr(plot.lawn.x + 0.3, plot.lawn.y + 0.3, plot.lawn.w - 0.3, plot.lawn.d - 0.3, 0.6) : rr(area.x + 0.1, area.y + 0.1, area.w + 0.5, area.d + 0.5, 0.3);
    shadows.push(st.path(base.map((p) => [p[0], p[1], plot ? -0.5 : -0.34])));
  });
  const st = first as Stage | null;
  if (!st) return { canvas: cv, w: wpx, h: hpx, s, marks: {} };
  const out = needsLightPass(st) ? grade(cv, st, make) : postOnly(cv, st);
  grain(out, style.grain, make);
  // The soft shadow each floor rests on, behind everything.
  const o2 = out.getContext('2d');
  if (o2) {
    o2.save();
    o2.setTransform(dpr, 0, 0, dpr, 0, 0);
    o2.globalCompositeOperation = 'destination-over';
    o2.filter = `blur(${0.34 * style.softShadow * s * dpr}px)`;
    o2.fillStyle = env.night || env.dark ? 'rgba(0,0,0,.5)' : 'rgba(70,48,28,.2)';
    shadows.forEach((p) => o2.fill(p));
    o2.restore();
  }
  return { canvas: out, w: wpx, h: hpx, s, marks: { ...st.marks } };
}
