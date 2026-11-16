/**
 * @file items.ts
 * @description The things in a scene as plain data. An item is `{ kind, ...props }`: where it stands (scene units; x runs down to the right, y down to the left, z up, the back walls at x = 0 and y = 0), what it looks like (colours as material names or hex) and its live state (a lamp's level and colour, a screen's state, who sits where, a fan's level, a battery's charge; `lit` and `running` switch things on). Things on a surface (a lamp on a sideboard, a mug on a table) go in their parent's `on` and stand on its top. `placeItems` draws a list; a scene never calls the objects directly unless it adds its own.
 * Used by: house.ts, closeup.ts, the examples, HousePicture.
 */
import type { Point3 } from '../clay';
import type { Paint } from './colors';
import { block, ball, bench, cylinder, boxStack, chest, coatRack, cupboard, dotsX, lightStripY, mirrorLightY, orb, paperBin, pinboardY, pipe, printer, shoes, sideTable, sideboardX, sideboardY, spot, tallMirrorX, umbrellaStand, wallStub } from './objects/pieces';
import { armchair, beanbag, books, bowl, chair, mug, pouf, remote, roundRug, roundTable, rug, sofaBack, sofaN, sofaW, stool, table, type ChairDir, type On, type RugOpts, type Seated } from './objects/furniture';
import { board, cabX, cabY, coffee, dishwasher, fridge, hob, island, jars, ovenTower, sink, upperY } from './objects/kitchen';
import { candle, floorLamp, lightBox, pendant, tableLamp, wallLightX } from './objects/light';
import { laptop, monitor, speaker, tvX, tvY, type ScreenState } from './objects/media';
import { bin, bollard, car, container, frontDoor, gardenSeat, gardenTree, heatPump, lantern, shrub, stringLights, wallbox, type ChargeState } from './objects/outdoor';
import { person, personNow, type Person } from './objects/people';
import { plant, type PlantKind } from './objects/plants';
import { basket, bath, bathTowel, bed, bookcaseX, bookcaseY, dresserX, dresserY, dryingRack, loo, nightstand, shower, stairs, stairwell, teddy, teepee, toyBlocks, vanity, wardrobe, washer, type Sleeper } from './objects/rooms';
import { battery, inverter, tank, ventBox } from './objects/utility';
import { backsplash, bunting, clockY, frameX, frameY, mirrorX, mirrorY, shelfX, shelfY, thermostatY, tiledWallY, towelsY, ventY, windowX, windowY, type ArtKind } from './objects/wall';
import type { LightState, Stage } from './stage';

/** Where an item stands. `z` is added to the surface it stands on (0 on the floor). */
interface At {
  x: number;
  y: number;
  z?: number;
}
/** A footprint. */
interface Area extends At {
  w: number;
  d: number;
}
/** The draw order: things are drawn back to front by x + y + bias. */
interface Biased {
  bias?: number;
}
/** Things standing on top, on the item's surface. */
interface Holds {
  on?: readonly Item[];
}
/** A lamp: its light when on. */
interface Lit {
  light?: LightState;
}
/** Which back wall a piece is on: `y` the right one (y = 0), `x` the left one (x = 0). */
type Wall = 'x' | 'y';

/** Every kind of item and its props. */
export interface ItemMap {
  // light
  floorLamp: At & Lit & { shade?: Paint; r?: number };
  tableLamp: At & Lit & Biased & { shade?: Paint; base?: Paint; r?: number };
  pendant: At & Lit & Biased & { z: number; shape?: 'globe' | 'dome'; shade?: Paint; r0?: number; r?: number; top?: number };
  wallLight: Lit & { y: number; z: number };
  lightBox: At & Lit;
  candle: At;
  spot: At & Lit & { r?: number; a?: number };
  lightStrip: Lit & { x0: number; x1: number; z: number; d?: number };
  mirrorLight: Lit & { x: number; z: number; w?: number };
  // people and plants
  person: At & Person & Biased & { noShadow?: boolean };
  plant: At & Biased & { plant: PlantKind; k?: number; pot?: Paint; vase?: Paint };
  // seating, tables, small things, rugs
  sofa: Area & { facing: 'back' | 'x' | 'y'; col?: Paint; people?: readonly Seated[]; throwCol?: Paint; pillows?: readonly (readonly [number, Paint])[] };
  armchair: At & { col?: Paint; pillow?: Paint; person?: Person; face?: 'x' | 'y' };
  pouf: At & { r?: number; col?: Paint };
  beanbag: At & { col?: Paint; k?: number };
  roundTable: At & Holds & { r: number; h: number; col?: Paint; leg?: Paint };
  table: Area & Holds & Biased & { h: number; col?: Paint; leg?: Paint; r?: number };
  chair: At & Biased & { dir: ChairDir; col?: Paint; seat?: Paint; person?: Person };
  stool: At & { h?: number; col?: Paint };
  mug: At & Biased & { col?: Paint };
  books: At & Biased & { cols?: readonly Paint[] };
  bowl: At & Biased & { fruit?: boolean };
  remote: At & Biased;
  rug: Area & RugOpts;
  roundRug: At & RugOpts & { r: number; star?: boolean };
  // the back walls
  frame: { wall: Wall; from: number; z: number; w: number; h: number; art: ArtKind; frame?: Paint };
  mirror: { wall: Wall; at: number; z: number; r: number; frame?: Paint };
  clock: { x: number; z: number; r: number };
  shelf: Holds & { wall: Wall; from: number; to: number; z: number; col?: Paint };
  bunting: { from: number; to: number; z: number };
  thermostat: { x: number; z: number; heating?: boolean };
  backsplash: { x0: number; x1: number; z0: number; z1: number; col?: Paint };
  tiledWall: { x0: number; x1: number; z0: number; z1: number; col?: Paint; joint?: Paint };
  towels: { x0: number; x1: number; z: number; cols?: readonly Paint[] };
  airValve: { x: number; z: number; level?: number };
  window: { wall: Wall; from: number; to: number; z0: number; z1: number; frame?: Paint; open?: number; curtain?: Paint; panes?: number; moon?: boolean };
  pinboard: { x0: number; x1: number; z0: number; z1: number; notes?: readonly (readonly [number, number, Paint])[] };
  wallDots: { dots: readonly (readonly [number, number, number])[]; col?: Paint };
  // screens and sound
  tv: { wall: Wall; from: number; to: number; z0: number; z1: number; state?: ScreenState };
  monitor: At & Biased & { w?: number; lit?: boolean };
  speaker: At & Biased & { w?: number; d?: number; h?: number; col?: Paint; playing?: boolean; k?: number };
  laptop: At & Biased & { lit?: boolean };
  // kitchen
  cabinets: Area & Holds & Biased & { facing: 'y' | 'x'; col?: Paint; top?: Paint; h?: number; doors?: number; dishwasher?: { x0: number; x1: number; running?: boolean } };
  island: Area & Holds & { col?: Paint; top?: Paint };
  sink: At & Biased;
  hob: At & Biased & { cooking?: boolean };
  wallCabinets: Lit & { x0: number; x1: number; z0: number; z1: number; col?: Paint; doors?: number };
  ovens: At & { col?: Paint; steam?: boolean; combi?: boolean };
  fridge: At & { col?: Paint };
  coffee: At & Biased & { ready?: boolean };
  jars: At & Biased;
  board: At & Biased;
  // bedrooms, storage, children, bathroom, laundry, stairs
  bed: Area & { duvet?: Paint; frame?: Paint; head?: Paint; headH?: number; sleepers?: readonly Sleeper[]; dots?: Paint; throwCol?: Paint };
  nightstand: At & Holds & { col?: Paint };
  dresser: Area & Holds & Biased & { facing: 'x' | 'y'; col?: Paint; h?: number };
  bookcase: Area & Holds & Biased & { facing: 'x' | 'y'; h: number; col?: Paint; rows?: number };
  wardrobe: At & Biased & { w: number; h?: number; col?: Paint };
  basket: At & { r?: number; h?: number };
  toyBlocks: At;
  teddy: At;
  teepee: At & { r?: number };
  bath: Area & { water?: boolean };
  bathTowel: { x0: number; x1: number; y: number; col?: Paint };
  vanity: At & { w: number; col?: Paint };
  loo: At & { side?: 'W' | 'N' };
  shower: Area & { running?: boolean };
  washer: At & Holds & { running?: boolean };
  dryingRack: At;
  stairs: Area & Biased & { n?: number; step?: number; tread?: Paint };
  stairwell: Area & { steps?: number };
  // the plant room
  battery: At & { soc: number };
  inverter: At;
  tank: At & { heat?: number };
  ventBox: At & { level?: number };
  // outdoors
  shrub: At & { k?: number; col?: Paint };
  gardenTree: At & { k?: number };
  bollard: At & { lit?: boolean };
  lantern: At & { lit?: boolean };
  bin: At & { col?: Paint };
  heatPump: At & { running?: boolean };
  wallbox: At & { state?: ChargeState };
  car: At & { col?: Paint; state?: 'home' | 'waiting' | 'charging'; cable?: readonly [number, number] | null };
  gardenSeat: At & { col?: Paint; cushion?: Paint };
  stringLights: { x0: number; x1: number; y: number; lit?: boolean; h?: number; bulbs?: number };
  frontDoor: At & { col?: Paint; mat?: Paint };
  container: At & Biased & { col: Paint; label?: boolean };
  // pieces and primitives
  sideboard: Area & Holds & Biased & { facing: Wall; h: number; col?: Paint; doors?: number };
  sideTable: At & Holds & { r?: number; h?: number; col?: Paint };
  cupboard: Area & Holds & { h: number; col?: Paint };
  chest: Area & { h: number; col?: Paint; lid?: Paint };
  bench: Area & { col?: Paint; leg?: Paint; h?: number };
  coatRack: Area & { col?: Paint; coats?: readonly (readonly [Paint, number])[] };
  umbrellaStand: At & { col?: Paint };
  shoes: At & { cols?: readonly Paint[] };
  boxStack: Area & { layers: readonly { h: number; col: Paint; inset?: number }[] };
  tallMirror: At & { w?: number; h?: number; frame?: Paint };
  paperBin: At;
  printer: At & Biased;
  orb: At & Biased & { col?: Paint; r?: number; stand?: Paint };
  block: Area & Biased & { h: number; col: Paint; r?: number; soft?: boolean | number; flat?: boolean; shadow?: boolean };
  ball: At & Biased & { r: number; col: Paint };
  cylinder: At & Biased & { r: number; h: number; col: Paint };
  pipe: Biased & { pts: readonly Point3[]; col: Paint; w?: number; at?: readonly [number, number] };
  wallStub: Area & Biased & { h: number };
}

/** One thing in a scene. */
export type Item = { [K in keyof ItemMap]: { kind: K } & ItemMap[K] }[keyof ItemMap];

/** The kinds of items. */
export type ItemKind = keyof ItemMap;

/** Where items are placed: the surface's height, and whether to draw at once (on a surface) or queue. */
interface Ctx {
  z: number;
  now: boolean;
}

type Def<P> = (st: Stage, it: P, cx: Ctx) => void;

const zOf = (it: { z?: number }, cx: Ctx) => cx.z + (it.z ?? 0);
const onOf = (st: Stage, items: readonly Item[] | undefined): On | undefined => (items?.length ? (h) => placeItems(st, items, { z: h, now: true }) : undefined);

/** A small thing drawn now on a surface, or queued at its place when it stands on its own. */
function small(st: Stage, cx: Ctx, kx: number, ky: number, bias: number | undefined, fn: () => void): void {
  if (cx.now) fn();
  else st.add(kx, ky, fn, bias ?? 0);
}

const DEFS: { [K in keyof ItemMap]: Def<ItemMap[K]> } = {
  floorLamp: (st, it) => floorLamp(st, it.x, it.y, ...st.lamp(it.light), { shade: it.shade, r: it.r }),
  tableLamp: (st, it, cx) => tableLamp(st, it.x, it.y, zOf(it, cx), ...st.lamp(it.light), { shade: it.shade, base: it.base, r: it.r, now: cx.now, bias: it.bias }),
  pendant: (st, it) => pendant(st, it.x, it.y, it.z, ...st.lamp(it.light), { kind: it.shape, shade: it.shade, r0: it.r0, r: it.r, top: it.top, bias: it.bias }),
  wallLight: (st, it) => wallLightX(st, it.y, it.z, ...st.lamp(it.light)),
  lightBox: (st, it, cx) => lightBox(st, it.x, it.y, zOf(it, cx), ...st.lamp(it.light)),
  candle: (st, it, cx) => small(st, cx, it.x, it.y, 0, () => candle(st, it.x, it.y, zOf(it, cx))),
  spot: (st, it, cx) => {
    const [lvl, col] = st.lamp(it.light);
    if (lvl) spot(st, it.x, it.y, zOf(it, cx) || 0.5, it.r ?? 2, col, it.a ?? lvl);
  },
  lightStrip: (st, it) => lightStripY(st, it.x0, it.x1, it.z, ...st.lamp(it.light), it.d),
  mirrorLight: (st, it) => mirrorLightY(st, it.x, it.z, st.lamp(it.light)[0] > 0, it.w),
  person: (st, it, cx) => {
    const o = { ...it, z: zOf(it, cx) };
    if (cx.now) personNow(st, it.x, it.y, o);
    else person(st, it.x, it.y, o);
  },
  plant: (st, it, cx) => plant(st, it.x, it.y, it.plant, { z: zOf(it, cx), k: it.k, pot: it.pot, vase: it.vase, now: cx.now, bias: it.bias }),
  sofa: (st, it) => {
    const o = { col: it.col, people: it.people, throwCol: it.throwCol, pillows: it.pillows };
    if (it.facing === 'back') sofaBack(st, it.x, it.y, it.w, it.d, o);
    else if (it.facing === 'x') sofaW(st, it.x, it.y, it.w, it.d, o);
    else sofaN(st, it.x, it.y, it.w, it.d, o);
  },
  armchair: (st, it) => armchair(st, it.x, it.y, { col: it.col, pillow: it.pillow, person: it.person, face: it.face }),
  pouf: (st, it) => pouf(st, it.x, it.y, it.r, it.col),
  beanbag: (st, it) => beanbag(st, it.x, it.y, it.col, it.k),
  roundTable: (st, it) => roundTable(st, it.x, it.y, it.r, it.h, { col: it.col, leg: it.leg, on: onOf(st, it.on) }),
  table: (st, it) => table(st, it.x, it.y, it.w, it.d, it.h, { col: it.col, leg: it.leg, r: it.r, on: onOf(st, it.on), bias: it.bias }),
  chair: (st, it) => chair(st, it.x, it.y, it.dir, it.col, { seat: it.seat, person: it.person, bias: it.bias }),
  stool: (st, it) => stool(st, it.x, it.y, it.h, it.col),
  mug: (st, it, cx) => small(st, cx, it.x, it.y, it.bias, () => mug(st, it.x, it.y, zOf(it, cx), it.col)),
  books: (st, it, cx) => small(st, cx, it.x, it.y, it.bias, () => books(st, it.x, it.y, zOf(it, cx), it.cols)),
  bowl: (st, it, cx) => small(st, cx, it.x, it.y, it.bias, () => bowl(st, it.x, it.y, zOf(it, cx), it.fruit ?? true)),
  remote: (st, it, cx) => small(st, cx, it.x, it.y, it.bias, () => remote(st, it.x, it.y, zOf(it, cx))),
  rug: (st, it) => rug(st, it.x, it.y, it.w, it.d, it),
  roundRug: (st, it) => roundRug(st, it.x, it.y, it.r, it),
  frame: (st, it) => (it.wall === 'y' ? frameY : frameX)(st, it.from, it.z, it.w, it.h, it.art, { frame: it.frame }),
  mirror: (st, it) => (it.wall === 'y' ? mirrorY : mirrorX)(st, it.at, it.z, it.r, { frame: it.frame }),
  clock: (st, it) => clockY(st, it.x, it.z, it.r),
  shelf: (st, it) => (it.wall === 'y' ? shelfY : shelfX)(st, it.from, it.to, it.z, { col: it.col, on: onOf(st, it.on) }),
  bunting: (st, it) => bunting(st, it.from, it.to, it.z),
  thermostat: (st, it) => thermostatY(st, it.x, it.z, it.heating),
  backsplash: (st, it) => backsplash(st, it.x0, it.x1, it.z0, it.z1, it.col),
  tiledWall: (st, it) => tiledWallY(st, it.x0, it.x1, it.z0, it.z1, it.col, it.joint),
  towels: (st, it) => towelsY(st, it.x0, it.x1, it.z, it.cols),
  airValve: (st, it) => ventY(st, it.x, it.z, it.level),
  window: (st, it) => (it.wall === 'y' ? windowY : windowX)(st, it.from, it.to, it.z0, it.z1, it),
  pinboard: (st, it) => pinboardY(st, it.x0, it.x1, it.z0, it.z1, it.notes),
  wallDots: (st, it) => dotsX(st, it.dots, it.col),
  tv: (st, it) => (it.wall === 'y' ? tvY : tvX)(st, it.from, it.to, it.z0, it.z1, it.state),
  monitor: (st, it, cx) => small(st, cx, it.x, it.y, it.bias, () => monitor(st, it.x, it.y, zOf(it, cx), it.w, it.lit)),
  speaker: (st, it, cx) => small(st, cx, it.x, it.y, it.bias, () => speaker(st, it.x, it.y, zOf(it, cx), it)),
  laptop: (st, it, cx) => small(st, cx, it.x, it.y, it.bias, () => laptop(st, it.x, it.y, zOf(it, cx), it.lit)),
  cabinets: (st, it) => {
    const dw = it.dishwasher;
    const o = { col: it.col, top: it.top, h: it.h, doors: it.doors, on: onOf(st, it.on), bias: it.bias, fronts: dw ? (yy: number, h: number) => dishwasher(st, dw.x0, dw.x1, yy, h, dw.running) : undefined };
    if (it.facing === 'y') cabY(st, it.x, it.y, it.w, it.d, o);
    else cabX(st, it.x, it.y, it.w, it.d, o);
  },
  island: (st, it) => island(st, it.x, it.y, it.w, it.d, { col: it.col, top: it.top, on: onOf(st, it.on) }),
  sink: (st, it, cx) => small(st, cx, it.x, it.y, it.bias, () => sink(st, it.x, it.y, zOf(it, cx))),
  hob: (st, it, cx) => small(st, cx, it.x, it.y, it.bias, () => hob(st, it.x, it.y, zOf(it, cx), it.cooking)),
  wallCabinets: (st, it) => upperY(st, it.x0, it.x1, it.z0, it.z1, { col: it.col, doors: it.doors, glow: st.lamp(it.light)[0] }),
  ovens: (st, it) => ovenTower(st, it.x, it.y, it),
  fridge: (st, it) => fridge(st, it.x, it.y, it),
  coffee: (st, it, cx) => small(st, cx, it.x, it.y, it.bias, () => coffee(st, it.x, it.y, zOf(it, cx), it.ready)),
  jars: (st, it, cx) => small(st, cx, it.x, it.y, it.bias, () => jars(st, it.x, it.y, zOf(it, cx))),
  board: (st, it, cx) => small(st, cx, it.x, it.y, it.bias, () => board(st, it.x, it.y, zOf(it, cx))),
  bed: (st, it) => bed(st, it.x, it.y, it.w, it.d, it),
  nightstand: (st, it) => nightstand(st, it.x, it.y, { col: it.col, on: onOf(st, it.on) }),
  dresser: (st, it) => (it.facing === 'x' ? dresserX : dresserY)(st, it.x, it.y, it.w, it.d, { col: it.col, h: it.h, on: onOf(st, it.on), bias: it.bias }),
  bookcase: (st, it) => (it.facing === 'x' ? bookcaseX : bookcaseY)(st, it.x, it.y, it.w, it.d, it.h, { col: it.col, rows: it.rows, on: onOf(st, it.on), bias: it.bias }),
  wardrobe: (st, it) => wardrobe(st, it.x, it.y, it.w, it),
  basket: (st, it) => basket(st, it.x, it.y, it.r, it.h),
  toyBlocks: (st, it) => toyBlocks(st, it.x, it.y),
  teddy: (st, it, cx) => teddy(st, it.x, it.y, zOf(it, cx)),
  teepee: (st, it) => teepee(st, it.x, it.y, it.r),
  bath: (st, it) => bath(st, it.x, it.y, it.w, it.d, it),
  bathTowel: (st, it) => bathTowel(st, it.x0, it.x1, it.y, it.col),
  vanity: (st, it) => vanity(st, it.x, it.y, it.w, it),
  loo: (st, it) => loo(st, it.x, it.y, it.side),
  shower: (st, it) => shower(st, it.x, it.y, it.w, it.d, { on: it.running }),
  washer: (st, it) => washer(st, it.x, it.y, { running: it.running, on: onOf(st, it.on) }),
  dryingRack: (st, it) => dryingRack(st, it.x, it.y),
  stairs: (st, it) => stairs(st, it.x, it.y, it.w, it.d, it),
  stairwell: (st, it) => stairwell(st, it.x, it.y, it.w, it.d, it),
  battery: (st, it) => battery(st, it.x, it.y, it.soc),
  inverter: (st, it) => inverter(st, it.x, it.y),
  tank: (st, it) => tank(st, it.x, it.y, it.heat),
  ventBox: (st, it) => ventBox(st, it.x, it.y, it.level),
  shrub: (st, it) => shrub(st, it.x, it.y, it.k, it.col),
  gardenTree: (st, it) => gardenTree(st, it.x, it.y, it.k),
  bollard: (st, it) => bollard(st, it.x, it.y, it.lit),
  lantern: (st, it) => lantern(st, it.x, it.y, it.lit),
  bin: (st, it) => bin(st, it.x, it.y, it.col),
  heatPump: (st, it) => heatPump(st, it.x, it.y, it.running),
  wallbox: (st, it) => wallbox(st, it.x, it.y, it.state),
  car: (st, it) => car(st, it.x, it.y, it),
  gardenSeat: (st, it) => gardenSeat(st, it.x, it.y, it),
  stringLights: (st, it) => stringLights(st, it.x0, it.x1, it.y, it.lit, it),
  frontDoor: (st, it, cx) => frontDoor(st, it.x, it.y, zOf(it, cx), it),
  container: (st, it, cx) => small(st, cx, it.x + 0.62, it.y + 0.25, it.bias, () => container(st, it.x, it.y, zOf(it, cx), it.col, it)),
  sideboard: (st, it) => (it.facing === 'y' ? sideboardY : sideboardX)(st, it.x, it.y, it.w, it.d, it.h, { col: it.col, doors: it.doors, on: onOf(st, it.on), bias: it.bias }),
  sideTable: (st, it) => sideTable(st, it.x, it.y, it.r, it.h, { col: it.col, on: onOf(st, it.on) }),
  cupboard: (st, it) => cupboard(st, it.x, it.y, it.w, it.d, it.h, { col: it.col, on: onOf(st, it.on) }),
  chest: (st, it) => chest(st, it.x, it.y, it.w, it.d, it.h, it),
  bench: (st, it) => bench(st, it.x, it.y, it.w, it.d, it),
  coatRack: (st, it) => coatRack(st, it.x, it.y, it.w, it.d, it),
  umbrellaStand: (st, it) => umbrellaStand(st, it.x, it.y, it),
  shoes: (st, it) => shoes(st, it.x, it.y, it),
  boxStack: (st, it) => boxStack(st, it.x, it.y, it.w, it.d, it.layers),
  tallMirror: (st, it) => tallMirrorX(st, it.x, it.y, it.w, it.h, it),
  paperBin: (st, it) => paperBin(st, it.x, it.y),
  printer: (st, it, cx) => small(st, cx, it.x + 0.25, it.y + 0.17, it.bias, () => printer(st, it.x, it.y, zOf(it, cx))),
  orb: (st, it, cx) => small(st, cx, it.x, it.y, it.bias, () => orb(st, it.x, it.y, zOf(it, cx), it)),
  block: (st, it, cx) => small(st, cx, it.x + it.w / 2, it.y + it.d / 2, it.bias, () => block(st, it.x, it.y, zOf(it, cx), it.w, it.d, it.h, st.paint(it.col, st.col.linen), it)),
  ball: (st, it, cx) => small(st, cx, it.x, it.y, it.bias, () => ball(st, it.x, it.y, zOf(it, cx), it.r, st.paint(it.col, st.col.blue))),
  cylinder: (st, it, cx) => small(st, cx, it.x, it.y, it.bias, () => cylinder(st, it.x, it.y, zOf(it, cx), it.r, it.h, st.paint(it.col, st.col.cream))),
  pipe: (st, it, cx) => small(st, cx, it.at?.[0] ?? it.pts[0][0], it.at?.[1] ?? it.pts[0][1], it.bias, () => pipe(st, it.pts, st.paint(it.col, st.col.ink), it.w)),
  wallStub: (st, it, cx) => small(st, cx, it.x + it.w / 2, it.y + it.d / 2, it.bias, () => wallStub(st, it.x, it.y, it.w, it.d, it.h)),
};

/** Every item kind, for a builder's tray or a validator. */
export const ITEM_KINDS = Object.keys(DEFS) as ItemKind[];

function place<K extends ItemKind>(st: Stage, it: { kind: K } & ItemMap[K], cx: Ctx): void {
  const def = DEFS[it.kind] as Def<ItemMap[K]>;
  def(st, it, cx);
}

/** Draws (or queues, back to front) a list of items on a stage; `at.z` is the surface they stand on. */
export function placeItems(st: Stage, items: readonly Item[], at: { z?: number; now?: boolean } = {}): void {
  const cx: Ctx = { z: at.z ?? 0, now: !!at.now };
  for (const it of items) {
    if (!(it.kind in DEFS)) continue;
    place(st, it, cx);
  }
}
