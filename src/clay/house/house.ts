/**
 * @file house.ts
 * @description A house picture from a plain model: floors of rooms (rectangles, or any outline: then the walls follow the rooms and doors, windows and passages are cut into them) (each with a floor kind, a wall paint, openings in its cut walls, the pieces on its back walls and its items with their live state), drawn as a cut-away dollhouse on a plinth: the two back walls painted per room with a skirting board, low cut partitions, low cut front walls with glass where there is a window or a garden door, and things back to front, room by room, each room's light held inside it. Floors stack with an offset; one room can be drawn alone (`only`); the first floor can stand in its plot (lawn, drive, terrace, garden things); a room can be selected (a coral outline, with corner handles for a builder) over a dotted grid. The picture goes through the light pass, the grain and gets the soft shadow it rests on, and reports anchors (`marks`) for callouts.
 * Ported from hearth-concept/clay2/house.js (floorFill, drawFloor, the plot, picture); the reference home's rooms and states are data in examples/home.ts.
 * Used by: scene.ts (renderHouse), HousePicture, the examples and tests.
 */
import { colorsFor, dk, lt, type Colors, type Paint } from './colors';
import { placeItems, type Item } from './items';
import { along, centroid, grown, innerPoint, oriented, solidRuns, walls as wallSegs, type WallSeg } from './outline';
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
  /**
   * The room's outline in plan, any number of corners, any order of winding (an L, a U, an angled wall); x, y, w and d
   * are then its bounds. A floor with an outline room is drawn from outlines: see `HouseFloor`.
   */
  outline?: readonly Pt2[];
  /** Pieces on the back walls (windows, frames, a TV on the wall is an item). */
  walls?: readonly Item[];
  items?: readonly Item[];
  marks?: readonly Mark[];
}

/** A stretch of a front edge: a low wall, glass (a window or a garden door) or an opening. */
export type FrontEdge = readonly [number, number, 'wall' | 'glass' | 'door'];

/**
 * A door, window or passage in a wall of an outline floor: the stretch of wall it takes (two points on the wall, in
 * plan) and what it is. Heights are in scene units like the walls (WALL_H high).
 */
export interface Opening {
  a: Pt2;
  b: Pt2;
  /** `door` a door leaf, `glass` a glass door or a window to the floor, `window` a window over a sill, `passage` an opening without a door. */
  kind: 'door' | 'window' | 'glass' | 'passage';
  /** Windows: the sill, 0.42 by default. */
  sill?: number;
  /** The top of the opening: 1.12 by default (WALL_H for a passage). */
  head?: number;
  /** Doors: hinged (the default), sliding or double. */
  style?: 'hinged' | 'sliding' | 'double';
  /** Hinged doors: the end the leaf turns on, and the side it opens to (1: the side the wall's normal of a→b's left points to). */
  hinge?: 'a' | 'b';
  side?: 1 | -1;
  /** The door's colour (the front door stands out). */
  col?: Paint;
}

export interface HouseFloor {
  id: string;
  /** Size along x and y. */
  w: number;
  d: number;
  rooms: readonly HouseRoom[];
  /** The cut front walls: along the edge x = w (`x`, by y) and y = d (`y`, by x). Not used by an outline floor. */
  front?: { x: readonly FrontEdge[]; y: readonly FrontEdge[] };
  /**
   * Doors, windows and passages of an outline floor. A floor is drawn from outlines when any of its rooms has an
   * `outline` or it has openings: its walls follow the rooms (a wall two rooms share is a low cut partition, an
   * outside wall facing away is full height unless part of the floor lies behind it, one facing the viewer is low),
   * and the openings are cut into them. `front`, `gapX` and `gapY` are then not used.
   */
  openings?: readonly Opening[];
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

function floorFill(st: Stage, r: HouseRoom, noBackShade = false): void {
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
  if (noBackShade) {
    // An outline room shades nothing: its walls are not where the rectangle's are.
  } else if (r.y < 0.01) {
    c.fillStyle = st.K.grad([x, y, 0], [x, y + 0.7, 0], 'rgba(74,50,30,.16)', 'rgba(74,50,30,0)');
    c.fill(st.path([[x, y, 0], [x + w, y, 0], [x + w, y + 0.7, 0], [x, y + 0.7, 0]]));
  }
  if (r.x < 0.01 && !noBackShade) {
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
  if (isOutlineFloor(floor)) {
    drawOutlineFloor(st, floor, scene, plot);
    return;
  }
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

// ---------- floors drawn from room outlines ----------

/** Door and window heights in scene units (WALL_H is a storey). */
export const DOOR_H = 1.12;
export const SILL_H = 0.42;
const FRONT_H = 0.2;

/** Whether a floor is drawn from its rooms' outlines. */
export function isOutlineFloor(f: HouseFloor): boolean {
  return Boolean(f.openings?.length) || f.rooms.some((r) => r.outline && r.outline.length >= 3);
}

/** A room's outline: its own, else its rectangle. */
export function outlineOf(r: HouseRoom): Pt2[] {
  if (r.outline && r.outline.length >= 3) return r.outline.slice();
  return [
    [r.x, r.y],
    [r.x + r.w, r.y],
    [r.x + r.w, r.y + r.d],
    [r.x, r.y + r.d],
  ];
}

/** The floor of a room of any outline: its finish, clipped to it. */
function floorFillOutline(st: Stage, r: HouseRoom, poly: readonly Pt2[]): void {
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  const box: HouseRoom = { ...r, x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), d: Math.max(...ys) - Math.min(...ys) };
  const c = st.c;
  c.save();
  c.clip(st.path(poly.map((p) => [p[0], p[1], 0] as const)));
  // The rectangle's fill and pattern over the bounds, kept to the outline; no darkening toward walls that are not there.
  floorFill(st, box, true);
  c.restore();
}

/** Where a room's light may reach: its floor and its walls up to their heights. */
function outlineClip(st: Stage, poly: readonly Pt2[], segs: readonly WallSeg[], tall: readonly (readonly [number, number, number, number, number])[] | undefined): Path2D {
  const p = new Path2D();
  p.addPath(st.path(poly.map((q) => [q[0], q[1], 0] as const)));
  p.addPath(st.path(poly.map((q) => [q[0], q[1], PART_H] as const)));
  for (const s of segs) {
    const h = s.tall ? WALL_H + 0.1 : PART_H + 0.02;
    p.addPath(
      st.path([
        [s.a[0], s.a[1], 0],
        [s.b[0], s.b[1], 0],
        [s.b[0], s.b[1], h],
        [s.a[0], s.a[1], h],
      ]),
    );
  }
  for (const b of tall ?? []) p.addPath(st.path(boxHex(b[0], b[1], b[2], b[3], b[4])));
  return p;
}

/** A slab of wall along a stretch of a segment, from z0 to z1, `t` thick: outward from the room, or centred (a partition). */
function slab(st: Stage, s: WallSeg, t0: number, t1: number, z0: number, z1: number, thick: number, centred: boolean, m: string | { t: string; l: string; r: string; e: string }): void {
  if (z1 - z0 <= 0.001 || t1 - t0 <= 1e-6) return;
  const a = along(s, t0);
  const b = along(s, t1);
  const k0 = centred ? -thick / 2 : 0;
  const k1 = centred ? thick / 2 : thick;
  st.prism(
    [
      [a[0] + s.nx * k0, a[1] + s.ny * k0],
      [b[0] + s.nx * k0, b[1] + s.ny * k0],
      [b[0] + s.nx * k1, b[1] + s.ny * k1],
      [a[0] + s.nx * k1, a[1] + s.ny * k1],
    ],
    z0,
    z1 - z0,
    m,
    { edge: 0.5 },
  );
}

/** The paint on a tall wall's inside, with its skirting, over a stretch. */
function paintInside(st: Stage, s: WallSeg, t0: number, t1: number, z0: number, z1: number, col: string): void {
  const a = along(s, t0);
  const b = along(s, t1);
  const off = -0.004;
  const ax = a[0] + s.nx * off;
  const ay = a[1] + s.ny * off;
  const bx = b[0] + s.nx * off;
  const by = b[1] + s.ny * off;
  // Lit like the back walls of a rectangle: the wall along x is the darker one.
  const shade = Math.abs(s.nx) > Math.abs(s.ny) ? dk(col, 0.085) : col;
  st.fill(
    [
      [ax, ay, z0],
      [bx, by, z0],
      [bx, by, z1],
      [ax, ay, z1],
    ],
    st.K.grad([ax, ay, z1], [ax, ay, z0], lt(shade, 0.1), dk(shade, 0.05)),
    false,
  );
  if (z0 < 0.07)
    st.fill(
      [
        [ax, ay, z0],
        [bx, by, z0],
        [bx, by, 0.07],
        [ax, ay, 0.07],
      ],
      st.col.cut,
    );
}

/** A wall with its openings: solid stretches, and per opening a lintel, a sill, glass or a door. */
function wallWithOpenings(st: Stage, s: WallSeg, h: number, thick: number, centred: boolean, openings: readonly Opening[], paint: string | null): void {
  const C = st.col;
  const part = { t: C.cut, l: C.wall, r: dk(C.wall, 0.1), e: '#FFFFFF' };
  const glassM = { t: 'rgba(255,255,255,.9)', l: 'rgba(196,224,236,.5)', r: 'rgba(176,208,224,.5)', e: '#FFFFFF' };
  const tall = h > PART_H + 0.05;
  for (const [t0, t1] of solidRuns(s)) {
    slab(st, s, t0, t1, 0, h, thick, centred, part);
    if (paint) paintInside(st, s, t0, t1, 0, h, paint);
  }
  for (const o of s.openings) {
    const op = openings[o.i];
    if (!op) continue;
    const head = Math.min(h, op.head ?? (op.kind === 'passage' ? WALL_H : DOOR_H));
    const posts = () => {
      const len = Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]) || 1;
      const dt = 0.05 / len;
      slab(st, s, o.t0, Math.min(o.t1, o.t0 + dt), 0, tall ? head : h + 0.18, thick, centred, part);
      slab(st, s, Math.max(o.t0, o.t1 - dt), o.t1, 0, tall ? head : h + 0.18, thick, centred, part);
    };
    if (op.kind === 'window') {
      const sill = Math.min(op.sill ?? SILL_H, head - 0.1);
      if (tall) {
        slab(st, s, o.t0, o.t1, 0, sill, thick, centred, part);
        slab(st, s, o.t0, o.t1, head, h, thick, centred, part);
        if (paint) {
          paintInside(st, s, o.t0, o.t1, 0, sill, paint);
          paintInside(st, s, o.t0, o.t1, head, h, paint);
        }
        slab(st, s, o.t0, o.t1, sill, head, 0.035, false, glassM);
      } else {
        slab(st, s, o.t0, o.t1, 0, h, thick, centred, part);
        slab(st, s, o.t0, o.t1, h, h + 0.16, 0.035, centred, glassM);
        posts();
      }
      continue;
    }
    if (op.kind === 'glass') {
      if (tall) {
        slab(st, s, o.t0, o.t1, head, h, thick, centred, part);
        if (paint) paintInside(st, s, o.t0, o.t1, head, h, paint);
        slab(st, s, o.t0, o.t1, 0, head, 0.035, false, glassM);
      } else {
        slab(st, s, o.t0, o.t1, 0, h + 0.16, 0.035, centred, glassM);
        posts();
      }
      continue;
    }
    // A door or a passage: open below its head; a lintel above it on a tall wall.
    if (tall) {
      slab(st, s, o.t0, o.t1, head, h, thick, centred, part);
      if (paint) paintInside(st, s, o.t0, o.t1, head, h, paint);
    }
    if (op.kind === 'door' && tall) doorLeaves(st, s, o.t0, o.t1, op, head);
  }
}

/** A door's leaves standing closed in a tall wall (sliding ones a little to the side). */
function doorLeaves(st: Stage, s: WallSeg, t0: number, t1: number, op: Opening, head: number): void {
  const col = st.paint(op.col, st.col.oak);
  const style = op.style ?? 'hinged';
  if (style === 'double') {
    const m = (t0 + t1) / 2;
    slab(st, s, t0 + 0.004, m - 0.004, 0.01, head - 0.01, 0.04, false, col);
    slab(st, s, m + 0.004, t1 - 0.004, 0.01, head - 0.01, 0.04, false, col);
    return;
  }
  slab(st, s, t0 + 0.004, t1 - 0.004, 0.01, head - 0.01, 0.04, false, col);
  // A handle on the side away from the hinge.
  const len = Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]) || 1;
  const th = op.hinge === 'b' ? t0 + 0.12 / len : t1 - 0.12 / len;
  const p = along(s, th);
  st.line([p[0] - s.nx * 0.005, p[1] - s.ny * 0.005, head * 0.48], [p[0] - s.nx * 0.005, p[1] - s.ny * 0.005, head * 0.52], st.col.ink, Math.max(1, st.s / 30));
}

/** What a door does on the floor: the arc a hinged leaf sweeps, the track of a sliding one; a threshold under every door. */
function doorOnFloor(st: Stage, s: WallSeg, op: Opening, t0: number, t1: number): void {
  const a = along(s, t0);
  const b = along(s, t1);
  const thin = Math.max(0.6, st.s / 70);
  const ink = 'rgba(59,54,51,.45)';
  // Which way the leaf swings: `side` 1 is the left of a→b (into the room whose wall it is, when its normal points right).
  const lx = -(b[1] - a[1]);
  const ly = b[0] - a[0];
  const L = Math.hypot(lx, ly) || 1;
  const sd = op.side ?? -1;
  const ux = (lx / L) * sd;
  const uy = (ly / L) * sd;
  const style = op.style ?? 'hinged';
  if (style === 'sliding') {
    st.line([a[0] + ux * 0.06, a[1] + uy * 0.06, 0.004], [b[0] + ux * 0.06 + (b[0] - a[0]) * 0.5, b[1] + uy * 0.06 + (b[1] - a[1]) * 0.5, 0.004], ink, thin);
    return;
  }
  const leaves: [Pt2, Pt2][] = style === 'double' ? [[a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]], [b, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]]] : op.hinge === 'b' ? [[b, a]] : [[a, b]];
  for (const [hinge, tip] of leaves) {
    const r = Math.hypot(tip[0] - hinge[0], tip[1] - hinge[1]);
    const ex = (tip[0] - hinge[0]) / (r || 1);
    const ey = (tip[1] - hinge[1]) / (r || 1);
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 12; i++) {
      const t = (i / 12) * (Math.PI / 2);
      pts.push([hinge[0] + (ex * Math.cos(t) + ux * Math.sin(t)) * r, hinge[1] + (ey * Math.cos(t) + uy * Math.sin(t)) * r, 0.004]);
    }
    st.pline(pts, ink, thin);
    st.line([hinge[0], hinge[1], 0.004], [hinge[0] + ux * r, hinge[1] + uy * r, 0.004], ink, thin);
  }
}

/** A floor drawn from its rooms' outlines, with its openings. */
function drawOutlineFloor(st: Stage, floor: HouseFloor, scene: HouseScene, plot: Plot | null): void {
  const C = st.col;
  const c = st.c;
  const only = scene.only ? (floor.rooms.find((r) => r.id === scene.only) ?? null) : null;
  const rooms = only ? [only] : floor.rooms.slice();
  const polys = rooms.map((r) => oriented(outlineOf(r)));
  const openings = floor.openings ?? [];
  const segs = wallSegs(polys, openings);
  const order = rooms.map((_, i) => i).sort((i, j) => (rooms[i].x + rooms[i].y) - (rooms[j].x + rooms[j].y));
  if (plot) {
    plotGround(st, plot);
    const g = st.lowered(0.3);
    placeItems(g, plot.behind ?? []);
    g.flush();
  }
  // The plinth under every room, grown past the walls; back to front so the front ones cover the seams.
  for (const i of order) st.prism(grown(polys[i], WALL_T + 0.08), -0.3, 0.3, C.plinth, { edge: 0.5 });
  const all = new Path2D();
  polys.forEach((p) => all.addPath(st.path(p.map((q) => [q[0], q[1], 0] as const))));
  st.floorClip = all;
  for (const i of order) floorFillOutline(st, rooms[i], polys[i]);
  // Doors on the floor: the arc or track and the threshold.
  for (const s of segs) {
    if (s.other !== null && !s.back) continue;
    for (const o of s.openings) {
      const op = openings[o.i];
      if (op?.kind === 'door') doorOnFloor(st, s, op, o.t0, o.t1);
    }
  }
  // The tall walls first: nothing of the floor is behind them.
  const paints = rooms.map((r) => st.x(st.paint(r.wall, C.wall)));
  for (const s of segs.filter((q) => q.tall).sort((p, q) => p.a[0] + p.a[1] - (q.a[0] + q.a[1]))) wallWithOpenings(st, s, WALL_H, WALL_T, false, openings, paints[s.room]);
  for (const i of order) {
    const r = rooms[i];
    if (!r.outline && (r.x < 0.01 || r.y < 0.01)) {
      st.roomClip = outlineClip(st, polys[i], segs.filter((q) => q.room === i), r.tall);
      placeItems(st, r.walls ?? []);
    }
  }
  // Rooms back to front: their partitions and low back walls, their things, then their low front walls.
  for (const i of order) {
    const r = rooms[i];
    const mine = segs.filter((q) => q.room === i);
    st.roomClip = outlineClip(st, polys[i], mine, r.tall);
    for (const s of mine) {
      if (s.tall || !s.back) continue;
      // A shared wall is drawn by the room it is the back of; an outside wall facing away is a low cut wall here.
      if (s.other !== null) wallWithOpenings(st, s, PART_H, 0.1, true, openings, null);
      else wallWithOpenings(st, s, PART_H, WALL_T, false, openings, null);
    }
    placeItems(st, r.items ?? []);
    markAll(st, r.marks);
    st.flush();
    const [mx, my] = r.outline ? innerPoint(polys[i]) : centroid(polys[i]);
    st.mark('room:' + r.id, mx, my, 0);
    for (const s of mine) if (!s.back && s.other === null) wallWithOpenings(st, s, FRONT_H, WALL_T, false, openings, null);
  }
  st.roomClip = null;
  const selIndex = scene.selected ? rooms.findIndex((q) => q.id === scene.selected) : -1;
  if (selIndex >= 0) {
    const poly = polys[selIndex];
    c.save();
    c.strokeStyle = C.coral;
    c.lineWidth = 3;
    c.lineJoin = 'round';
    c.stroke(st.path(poly.map((p) => [p[0], p[1], 0.02] as const)));
    if (scene.handles)
      for (const [a, b] of poly) {
        const [hx, hy] = st.P(a, b, 0.02);
        c.beginPath();
        c.arc(hx, hy, 6.5, 0, TAU);
        c.fillStyle = '#fff';
        c.fill();
        c.lineWidth = 2.5;
        c.stroke();
      }
    c.restore();
    const xs = poly.map((p) => p[0]);
    const ys = poly.map((p) => p[1]);
    st.mark('selEx', Math.max(...xs), (Math.min(...ys) + Math.max(...ys)) / 2, 0);
    st.mark('selNx', (Math.min(...xs) + Math.max(...xs)) / 2, Math.min(...ys), 0);
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

/** The picture's extent at scale s (1: scene units), without padding: left, right, top, bottom around the origin. */
export function houseExtent(scene: HouseScene, s = 1): { l: number; r: number; t: number; b: number } {
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
    l = Math.min(l, e.l * s + i * step[0] * s);
    r = Math.max(r, e.r * s + i * step[0] * s);
    t = Math.min(t, e.t * s - i * step[1] * s);
    b = Math.max(b, e.b * s - i * step[1] * s);
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
  const unit = houseExtent(scene);
  const g = scene.grid ? 1.1 : 0;
  let s = o.s ?? 30;
  if (o.fit) s = Math.max(0.01, Math.min((o.fit.w - pad * 2) / (unit.r - unit.l + g * 2), (o.fit.h - pad * 2) / (unit.b - unit.t + g)));
  // In pixels, in the concept's order of rounding, so a picture at a given scale has the concept's size.
  const ext = houseExtent(scene, s);
  const gp = g * s;
  const wpx = o.fit ? o.fit.w : Math.ceil(ext.r - ext.l + pad * 2 + gp * 2);
  const hpx = o.fit ? o.fit.h : Math.ceil(ext.b - ext.t + pad * 2 + gp);
  const cv = make(Math.round(wpx * dpr), Math.round(hpx * dpr));
  const c = cv.getContext('2d');
  if (!c) return { canvas: cv, w: wpx, h: hpx, s, marks: {} };
  c.scale(dpr, dpr);
  // Centred in a fitted box; otherwise padded from the top left.
  const spareX = o.fit ? (wpx - (ext.r - ext.l + gp * 2) - pad * 2) / 2 : 0;
  const spareY = o.fit ? (hpx - (ext.b - ext.t + gp) - pad * 2) / 2 : 0;
  const ox = pad + gp - ext.l + spareX;
  const oy = pad + gp * 0.5 - ext.t + spareY;
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
    if (!plot && !scene.only && isOutlineFloor(floor)) {
      // The shadow follows the rooms: a house that is not a rectangle leaves its corners open.
      const p = new Path2D();
      for (const r of floor.rooms) p.addPath(st.path(grown(outlineOf(r), 0.3).map((q) => [q[0] + 0.1, q[1] + 0.1, -0.34] as const)));
      shadows.push(p);
    } else shadows.push(st.path(base.map((p) => [p[0], p[1], plot ? -0.5 : -0.34])));
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
