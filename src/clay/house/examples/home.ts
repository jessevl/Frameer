/**
 * @file home.ts
 * @description An example house as data: a three-floor family home with a garden, the house of the Hearth concept's pictures, and four moments of its live state (an evening with a film paused, cooking, late at night, and plain). It shows how a scene describes rooms, wall pieces, furniture and devices, and is the fixture the engine's tests and the visual comparison draw. An app builds its own scene from its own data the same way; nothing here is built into the engine.
 * Ported from hearth-concept/clay2/house.js (ROOMS, FRONT, TALL, FURNISH, the plot, STATES).
 * Used by: house.test.ts, scripts/house-pictures.ts, docs.
 */
import { WARM, type RGB } from '../colors';
import type { HouseFloor, HouseScene, Mark, Plot } from '../house';
import type { Item } from '../items';
import type { Person } from '../objects/people';
import type { Sleeper } from '../objects/rooms';
import type { LightState } from '../stage';

type Placed = Person & { x: number; y: number };

/** The live state of the example home. Lights are [level, colour]. */
export interface HomeState {
  lights?: Partial<Record<string, readonly [number, RGB]>>;
  people?: {
    living?: readonly (Person & { t: number })[];
    study?: readonly (Person & { t: number })[];
    bed?: readonly Sleeper[];
    kidsBed?: readonly Sleeper[];
    office?: readonly Person[];
    kitchen?: readonly Placed[];
    hall0?: readonly Placed[];
    hall1?: readonly Placed[];
    bedroom?: readonly Placed[];
    bathroom?: readonly Placed[];
    closet?: readonly Placed[];
    den?: readonly Placed[];
  };
  shutters?: { living?: number; bedroom?: number; kids?: number };
  sonos?: { kitchen?: boolean; bedroom?: boolean; office?: boolean; den?: boolean };
  ovens?: { steam?: boolean; combi?: boolean };
  tv?: 'off' | 'playing' | 'paused';
  denTv?: 'off' | 'playing' | 'paused';
  vent?: number;
  battery?: readonly [number, number];
  tank?: number;
  car?: 'home' | 'waiting' | 'charging' | 'away';
  heatPump?: boolean;
  heating?: boolean;
  cooking?: boolean;
  coffeeReady?: boolean;
  dishwasher?: boolean;
  bath?: boolean;
  shower?: boolean;
  monitor?: boolean;
  laptop?: boolean;
  washer?: boolean;
  /** Candles lit on the dining table (an evening with people in). */
  candles?: boolean;
}

/** Four moments of the example home. */
export const HOME_STATES = {
  /** Sunday evening: the film paused, a blue lamp, somebody in the walk-in closet, a child asleep. */
  evening: {
    tv: 'paused',
    vent: 0,
    battery: [0.49, 0.37],
    tank: 0.8,
    candles: true,
    lights: {
      livingSide: [0.89, [110, 158, 255]],
      livingAccent: [0.46, [255, 160, 110]],
      livingUpDown: [0.25, [255, 198, 245]],
      kitchenSpots: [0.06, WARM],
      kitchenCab: [0.1, WARM],
      hall: [0.08, WARM],
      officeMain: [0.12, [186, 152, 255]],
      closet: [0.48, [255, 184, 58]],
      kidsBox: [0.1, [255, 96, 15]],
      frontDoor: [1, WARM],
      garden: [1, WARM],
    },
    people: {
      living: [{ t: 0.66, shirt: 'blue', hair: 'hairB' }],
      closet: [{ x: 5.7, y: 3.72, shirt: 'coral', hair: 'hairA', facing: 'back' }],
      kidsBed: [{ t: 0.5, k: 0.74, hair: 'hairB' }],
    },
    shutters: { kids: 0.03 },
    car: 'home',
  },
  /** An early evening in the kitchen. */
  cooking: {
    tv: 'off',
    vent: 2,
    battery: [0.62, 0.55],
    tank: 0.9,
    cooking: true,
    coffeeReady: true,
    ovens: { steam: true },
    sonos: { kitchen: true },
    lights: { kitchenSpots: [0.9, WARM], kitchenCab: [0.7, WARM], frontDoor: [1, WARM] },
    people: { kitchen: [{ x: 7.05, y: 1.55, shirt: 'coral', hair: 'hairA', facing: 'right' }], living: [] },
    car: 'home',
  },
  /** Late: everyone upstairs, the car waiting for the cheap hours. */
  night: {
    tv: 'off',
    vent: 0,
    battery: [0.46, 0.36],
    tank: 0.78,
    lights: { bedroomAccent: [0.6, [255, 170, 120]], frontDoor: [1, WARM], kidsBox: [0.1, [255, 96, 15]] },
    people: {
      bed: [
        { t: 0.28, hair: 'hairA', awake: true },
        { t: 0.74, hair: 'hairB' },
      ],
      kidsBed: [{ t: 0.5, k: 0.74, hair: 'hairB' }],
    },
    shutters: { living: 0.04, kids: 0.03, bedroom: 0.04 },
    car: 'waiting',
  },
  /** Nothing on, nobody home: the builder's picture. */
  plain: { battery: [0.6, 0.6], tank: 0.8, car: 'home' },
} as const satisfies Record<string, HomeState>;

export type HomeStateName = keyof typeof HOME_STATES;

const wall = (from: number, to: number) => [from, to, 'wall'] as const;
const glass = (from: number, to: number) => [from, to, 'glass'] as const;
const door = (from: number, to: number) => [from, to, 'door'] as const;

/** The example home's floors for a state. */
export function homeFloors(S: HomeState): HouseFloor[] {
  const L = (n: string): LightState | undefined => {
    const v = S.lights?.[n];
    return v ? { level: v[0], color: v[1] } : undefined;
  };
  const P = S.people ?? {};
  const sh = { living: 1, bedroom: 1, kids: 1, ...S.shutters };
  const sonos = S.sonos ?? {};
  const placed = (list: readonly Placed[] | undefined): Item[] => (list ?? []).map((p) => ({ kind: 'person', ...p }));
  const battery = S.battery ?? [0.5, 0.5];
  const chairs: Item[] = [2.72, 3.24, 3.76].flatMap((x): Item[] => [
    { kind: 'chair', x, y: 3.86, dir: 'N', col: 'walnut', seat: 'linen' },
    { kind: 'chair', x, y: 5.2, dir: 'S', col: 'walnut', seat: 'linen' },
  ]);
  const living = P.living ?? [];
  const ground: HouseFloor = {
    id: 'ground',
    w: 8,
    d: 6.2,
    front: {
      y: [wall(0, 0.7), glass(0.7, 3.9), wall(3.9, 5.85), door(5.85, 6.62), wall(6.62, 8)],
      x: [wall(0, 0.6), glass(0.6, 2.9), wall(2.9, 6.2)],
    },
    rooms: [
      {
        id: 'living',
        x: 0,
        y: 0,
        w: 4.8,
        d: 6.2,
        floor: 'wood',
        wall: '#F6F0E6',
        walls: [
          { kind: 'window', wall: 'x', from: 0.95, to: 2.25, z0: 0.46, z1: 1.2, open: sh.living, curtain: 'linen', panes: 3 },
          { kind: 'window', wall: 'y', from: 3.6, to: 4.5, z0: 0.5, z1: 1.2, open: sh.living, curtain: 'linen', moon: true },
          { kind: 'frame', wall: 'x', from: 4.72, z: 0.72, w: 0.62, h: 0.5, art: 'sun' },
          { kind: 'frame', wall: 'x', from: 5.45, z: 0.62, w: 0.46, h: 0.62, art: 'lines', frame: 'ink' },
          { kind: 'frame', wall: 'x', from: 4.82, z: 0.34, w: 0.4, h: 0.3, art: 'arch', frame: 'walnut' },
          { kind: 'thermostat', x: 3.28, z: 0.82, heating: !!S.heating },
        ],
        items: [
          { kind: 'rug', x: 0.95, y: 0.72, w: 3.1, d: 2.75, col: '#EAD9CC', pattern: 'diamond', line: '#F7EEE6' },
          {
            kind: 'sideboard',
            facing: 'y',
            x: 1.18,
            y: 0.03,
            w: 2.0,
            d: 0.42,
            h: 0.33,
            bias: -0.12,
            on: [
              { kind: 'speaker', x: 2.1, y: 0.3, w: 0.7, d: 0.12, h: 0.08, col: 'graphite', playing: S.tv === 'playing', k: 1.2 },
              { kind: 'block', x: 1.32, y: 0.2, w: 0.12, d: 0.12, h: 0.035, r: 0.001, col: 'ink', flat: true },
              { kind: 'plant', x: 2.98, y: 0.24, plant: 'trail' },
            ],
          },
          { kind: 'tv', wall: 'y', from: 1.3, to: 2.9, z0: 0.62, z1: 1.24, state: S.tv ?? 'off' },
          { kind: 'sideTable', x: 3.36, y: 0.3, r: 0.2, h: 0.4, on: [{ kind: 'tableLamp', x: 3.36, y: 0.3, light: L('livingAccent'), r: 2.2 }] },
          { kind: 'floorLamp', x: 0.42, y: 0.45, light: L('livingSide'), r: 3.0 },
          { kind: 'wallLight', y: 2.62, z: 0.95, light: L('livingUpDown') },
          { kind: 'armchair', x: 0.28, y: 0.95, face: 'x', col: 'sage', pillow: 'mustard' },
          {
            kind: 'roundTable',
            x: 2.4,
            y: 1.75,
            r: 0.42,
            h: 0.3,
            on: [
              { kind: 'books', x: 2.22, y: 1.62 },
              { kind: 'mug', x: 2.6, y: 1.78, col: 'coralLight' },
              { kind: 'remote', x: 2.42, y: 1.92 },
            ],
          },
          { kind: 'sofa', facing: 'back', x: 1.15, y: 2.42, w: 2.55, d: 0.98, col: 'linen', people: living, throwCol: 'mustard' },
          { kind: 'pendant', x: 2.4, y: 1.75, z: 1.32, light: L('coffeePendant'), r0: 0.17 },
          {
            kind: 'bookcase',
            facing: 'x',
            x: 0.02,
            y: 3.0,
            w: 0.34,
            d: 1.5,
            h: 1.06,
            on: [
              { kind: 'plant', x: 0.19, y: 3.3, plant: 'trail' },
              { kind: 'speaker', x: 0.19, y: 4.1, w: 0.2, d: 0.3, h: 0.14, col: 'white' },
            ],
          },
          { kind: 'pouf', x: 0.6, y: 5.0, r: 0.26, col: 'terracotta' },
          {
            kind: 'table',
            x: 2.55,
            y: 4.25,
            w: 1.75,
            d: 0.95,
            h: 0.42,
            r: 0.2,
            on: [
              { kind: 'block', x: 2.95, y: 4.52, w: 0.95, d: 0.4, h: 0.002, r: 0.04, col: 'linen', flat: true },
              { kind: 'plant', x: 3.42, y: 4.72, plant: 'flowers' },
              { kind: 'candle', x: 3.05, y: 4.72 },
              { kind: 'bowl', x: 3.85, y: 4.72 },
            ],
          },
          ...chairs,
          { kind: 'pendant', x: 3.0, y: 4.72, z: 1.2, light: L('dining'), shape: 'dome', shade: 'sageDeep' },
          { kind: 'pendant', x: 3.85, y: 4.72, z: 1.2, light: L('dining'), shape: 'dome', shade: 'sageDeep' },
          { kind: 'plant', x: 4.38, y: 5.72, plant: 'monstera', k: 1.15 },
          { kind: 'plant', x: 4.45, y: 0.42, plant: 'snake', pot: 'cream' },
          { kind: 'basket', x: 0.42, y: 5.75, r: 0.2, h: 0.3 },
        ],
        marks: [{ name: 'tv', x: 2.1, y: 0.07, z: 1.24 }, { name: 'sideLamp', x: 0.42, y: 0.45, z: 1.25 }, ...(living.length ? [{ name: 'sofa', x: 2.4, y: 2.9, z: 1.0 }] : [])],
      },
      {
        id: 'kitchen',
        x: 4.8,
        y: 0,
        w: 3.2,
        d: 3.4,
        floor: 'tile',
        wall: '#F3F0E8',
        gapX: [0.72, 3.4],
        walls: [
          { kind: 'backsplash', x0: 6.16, x1: 8, z0: 0.5, z1: 0.98 },
          { kind: 'window', wall: 'y', from: 7.2, to: 7.86, z0: 0.62, z1: 1.22, panes: 2 },
        ],
        items: [
          { kind: 'fridge', x: 4.88, y: 0.02 },
          { kind: 'ovens', x: 5.54, y: 0.02, steam: !!S.ovens?.steam, combi: !!S.ovens?.combi },
          { kind: 'wallCabinets', x0: 6.2, x1: 7.08, z0: 1.0, z1: 1.38, col: 'cream', light: L('kitchenCab') },
          {
            kind: 'cabinets',
            facing: 'y',
            x: 6.18,
            y: 0.02,
            w: 1.82,
            d: 0.6,
            doors: 3,
            dishwasher: { x0: 6.2, x1: 6.78, running: !!S.dishwasher },
            on: [
              { kind: 'coffee', x: 6.26, y: 0.12, ready: !!S.coffeeReady },
              { kind: 'jars', x: 6.72, y: 0.2 },
              { kind: 'sink', x: 7.3, y: 0.14 },
              { kind: 'plant', x: 7.55, y: 0.07, z: 0.2, plant: 'herb' },
              { kind: 'speaker', x: 7.05, y: 0.2, w: 0.13, d: 0.13, h: 0.17, col: 'white', playing: !!sonos.kitchen },
            ],
          },
          { kind: 'rug', x: 5.75, y: 0.82, w: 1.5, d: 0.62, col: 'sageLight', pattern: 'stripes', line: 'cream', r: 0.06 },
          {
            kind: 'island',
            x: 5.38,
            y: 1.7,
            w: 1.55,
            d: 0.78,
            on: [
              { kind: 'bowl', x: 5.75, y: 2.1 },
              { kind: 'remote', x: 6.2, y: 2.25 },
              { kind: 'board', x: 6.45, y: 1.86 },
            ],
          },
          { kind: 'stool', x: 5.78, y: 2.78 },
          { kind: 'stool', x: 6.5, y: 2.78 },
          {
            kind: 'cabinets',
            facing: 'x',
            x: 7.42,
            y: 0.64,
            w: 0.58,
            d: 2.25,
            on: [
              { kind: 'hob', x: 7.5, y: 1.3, cooking: !!S.cooking },
              { kind: 'jars', x: 7.62, y: 2.55 },
            ],
          },
          ...placed(P.kitchen),
          { kind: 'pendant', x: 5.78, y: 2.08, z: 1.22, light: L('kitchenSpots'), shape: 'dome', shade: 'terracotta' },
          { kind: 'pendant', x: 6.52, y: 2.08, z: 1.22, light: L('kitchenSpots'), shape: 'dome', shade: 'terracotta' },
          { kind: 'spot', x: 7.5, y: 1.6, z: 0.5, r: 1.6, a: 0.8, light: L('kitchenSpots') },
        ],
        marks: S.ovens?.steam ? [{ name: 'oven', x: 5.86, y: 0.64, z: 0.9 }] : [],
      },
      {
        id: 'hall0',
        x: 4.8,
        y: 3.4,
        w: 1.9,
        d: 2.8,
        floor: 'wood',
        gapX: [4.95, 5.95],
        tall: [
          [4.93, 3.58, 0.85, 2.3, 0.8],
          [6.36, 3.56, 0.28, 0.86, 1.02],
        ],
        items: [
          { kind: 'stairs', x: 4.93, y: 3.58, w: 0.85, d: 2.3, n: 6 },
          { kind: 'rug', x: 5.95, y: 4.05, w: 0.62, d: 1.7, col: 'mustard', pattern: 'stripes', line: 'cream', r: 0.06 },
          { kind: 'coatRack', x: 6.36, y: 3.56, w: 0.28, d: 0.86 },
          { kind: 'umbrellaStand', x: 6.5, y: 5.85 },
          { kind: 'shoes', x: 5.92, y: 5.74 },
          { kind: 'pendant', x: 6.15, y: 4.85, z: 1.25, light: L('hall'), r0: 0.13 },
          ...placed(P.hall0),
        ],
      },
      {
        id: 'utility',
        x: 6.7,
        y: 3.4,
        w: 1.3,
        d: 2.8,
        floor: 'concrete',
        gapX: [4.5, 5.2],
        tall: [
          [6.8, 3.5, 1.2, 0.5, 0.82],
          [6.84, 4.2, 1.1, 0.5, 1.02],
          [7.2, 5.28, 0.64, 0.64, 1.45],
        ],
        items: [
          { kind: 'inverter', x: 6.8, y: 3.5 },
          { kind: 'ventBox', x: 7.34, y: 3.5, level: S.vent ?? 0 },
          { kind: 'battery', x: 6.84, y: 4.2, soc: battery[0] },
          { kind: 'battery', x: 7.4, y: 4.2, soc: battery[1] },
          { kind: 'tank', x: 7.52, y: 5.6, heat: S.tank ?? 0.8 },
          {
            kind: 'boxStack',
            x: 6.82,
            y: 5.5,
            w: 0.4,
            d: 0.5,
            layers: [
              { h: 0.22, col: 'blue' },
              { h: 0.2, col: 'mustard', inset: 0.02 },
            ],
          },
        ],
        marks: [
          { name: 'vent', x: 7.65, y: 3.7, z: 0.95 },
          { name: 'battery', x: 7.36, y: 4.44, z: 1.05 },
          { name: 'tank', x: 7.52, y: 5.6, z: 1.4 },
        ],
      },
    ],
  };

  const kidsBed = P.kidsBed ?? [];
  const first: HouseFloor = {
    id: 'first',
    w: 8,
    d: 6.2,
    front: {
      y: [wall(0, 1.2), glass(1.2, 3.2), wall(3.2, 5.6), glass(5.6, 7.2), wall(7.2, 8)],
      x: [wall(0, 3.2), glass(3.2, 4.1), wall(4.1, 6.2)],
    },
    rooms: [
      {
        id: 'bedroom',
        x: 0,
        y: 0,
        w: 4.4,
        d: 3.6,
        floor: 'wood',
        wall: '#E3E9DA',
        walls: [
          { kind: 'window', wall: 'x', from: 0.85, to: 2.05, z0: 0.46, z1: 1.2, open: sh.bedroom, curtain: 'sageLight', panes: 3 },
          { kind: 'window', wall: 'y', from: 3.5, to: 4.22, z0: 0.5, z1: 1.2, open: sh.bedroom, curtain: 'sageLight', moon: true },
          { kind: 'frame', wall: 'y', from: 1.82, z: 0.94, w: 0.5, h: 0.38, art: 'hills' },
          { kind: 'frame', wall: 'y', from: 2.4, z: 0.98, w: 0.3, h: 0.3, art: 'plain', frame: 'walnut' },
          { kind: 'mirror', wall: 'x', at: 2.85, z: 1.0, r: 0.24 },
        ],
        items: [
          { kind: 'rug', x: 0.85, y: 1.2, w: 2.85, d: 1.95, col: '#EFE6D8', pattern: 'dots', line: '#FBF6EE' },
          { kind: 'plant', x: 0.36, y: 0.4, plant: 'snake', pot: 'cream' },
          {
            kind: 'nightstand',
            x: 0.9,
            y: 0.05,
            on: [
              { kind: 'tableLamp', x: 1.06, y: 0.2, light: L('bedroomAccent'), shade: 'blush' },
              { kind: 'block', x: 1.17, y: 0.27, w: 0.07, d: 0.07, h: 0.07, r: 0.015, col: 'white' },
            ],
          },
          { kind: 'bed', x: 1.36, y: 0.03, w: 1.7, d: 2.15, duvet: 'sageLight', throwCol: 'mustard', sleepers: P.bed ?? [] },
          {
            kind: 'nightstand',
            x: 3.14,
            y: 0.05,
            on: [
              { kind: 'speaker', x: 3.32, y: 0.2, w: 0.18, d: 0.24, h: 0.14, col: 'white', playing: !!sonos.bedroom },
              { kind: 'books', x: 3.2, y: 0.3, cols: ['coralLight', 'blue'] },
            ],
          },
          {
            kind: 'dresser',
            facing: 'x',
            x: 0.03,
            y: 2.35,
            w: 0.42,
            d: 1.0,
            on: [
              { kind: 'plant', x: 0.24, y: 2.55, plant: 'flowers', k: 0.8 },
              { kind: 'cylinder', x: 0.24, y: 3.05, r: 0.03, h: 0.1, col: 'blush' },
              { kind: 'cylinder', x: 0.3, y: 3.15, r: 0.025, h: 0.07, col: 'mustard' },
            ],
          },
          { kind: 'bench', x: 1.55, y: 2.36, w: 1.3, d: 0.36, col: 'linenDeep' },
          { kind: 'basket', x: 4.02, y: 3.2, r: 0.2, h: 0.34 },
          ...placed(P.bedroom),
          { kind: 'pendant', x: 2.2, y: 1.7, z: 1.34, light: L('bedroomMain'), r0: 0.18 },
        ],
        marks: [{ name: 'radio', x: 3.32, y: 0.2, z: 0.6 }],
      },
      {
        id: 'bathroom',
        x: 4.4,
        y: 0,
        w: 3.6,
        d: 2.7,
        floor: 'bath',
        wall: '#DCE7EA',
        gapX: [1.45, 2.2],
        walls: [
          { kind: 'tiledWall', x0: 4.4, x1: 8, z0: 0.07, z1: 1.02 },
          { kind: 'mirror', wall: 'y', at: 5.16, z: 0.98, r: 0.25, frame: 'walnut' },
          { kind: 'mirrorLight', x: 5.16, z: 1.28, light: L('bathMirror') },
          { kind: 'window', wall: 'y', from: 6.5, to: 7.2, z0: 0.92, z1: 1.28, panes: 2 },
          { kind: 'airValve', x: 7.62, z: 1.15, level: S.vent ?? 0 },
        ],
        items: [
          { kind: 'vanity', x: 4.6, y: 0.03, w: 1.12 },
          { kind: 'bath', x: 6.05, y: 0.08, w: 1.8, d: 0.86, water: !!S.bath },
          { kind: 'bathTowel', x0: 6.25, x1: 6.7, y: 0.945 },
          { kind: 'loo', x: 4.92, y: 1.02, side: 'W' },
          { kind: 'rug', x: 5.5, y: 1.05, w: 0.82, d: 0.5, col: 'mustard', line: 'cream', r: 0.1 },
          { kind: 'shower', x: 6.86, y: 1.55, w: 1.02, d: 1.05, on: !!S.shower },
          { kind: 'basket', x: 4.72, y: 2.3, r: 0.17, h: 0.3 },
          ...placed(P.bathroom),
          { kind: 'spot', x: 5.6, y: 1.2, z: 0.6, r: 2.6, light: L('bathSpots') },
          { kind: 'spot', x: 7.2, y: 1.2, z: 0.6, r: 2.0, light: L('bathSpots') },
        ],
      },
      {
        id: 'closet',
        x: 4.4,
        y: 2.7,
        w: 3.6,
        d: 1.8,
        floor: 'wood',
        gapX: [3.0, 3.8],
        tall: [
          [4.56, 2.76, 2.3, 0.56, 1.02],
          [7.0, 2.78, 0.9, 0.44, 0.52],
          [7.72, 3.6, 0.06, 0.6, 1.02],
        ],
        items: [
          { kind: 'wardrobe', x: 4.56, y: 2.76, w: 2.3, h: 0.98 },
          { kind: 'rug', x: 4.9, y: 3.5, w: 2.5, d: 0.72, col: 'blush', pattern: 'stripes', line: 'cream', r: 0.08 },
          {
            kind: 'dresser',
            facing: 'y',
            x: 7.0,
            y: 2.78,
            w: 0.9,
            d: 0.44,
            h: 0.42,
            col: 'cream',
            on: [
              { kind: 'block', x: 7.1, y: 2.86, w: 0.26, d: 0.2, h: 0.05, r: 0.03, col: 'ink' },
              { kind: 'block', x: 7.5, y: 2.88, w: 0.3, d: 0.24, h: 0.1, r: 0.04, col: 'ochre', soft: 0.3 },
            ],
          },
          { kind: 'tallMirror', x: 7.72, y: 3.6 },
          { kind: 'pouf', x: 6.75, y: 3.92, r: 0.24, col: 'mustard' },
          ...placed(P.closet),
          { kind: 'pendant', x: 6.0, y: 3.65, z: 1.25, light: L('closet'), r0: 0.15 },
        ],
        marks: [...(P.closet ?? []).map((p) => ({ name: 'closetPerson', x: p.x, y: p.y, z: 1.0 })), { name: 'closetLamp', x: 6.0, y: 3.65, z: 1.4 }],
      },
      {
        id: 'kids',
        x: 0,
        y: 3.6,
        w: 4.4,
        d: 2.6,
        floor: 'wood',
        wall: '#F7E3DA',
        tall: [
          [0.17, 3.66, 1.14, 0.12, 0.64],
          [2.25, 3.66, 1.25, 0.3, 0.9],
        ],
        walls: [
          { kind: 'window', wall: 'x', from: 4.3, to: 5.4, z0: 0.5, z1: 1.2, open: sh.kids, panes: 2 },
          { kind: 'bunting', from: 3.72, to: 6.05, z: 1.36 },
          {
            kind: 'wallDots',
            dots: [
              [3.9, 1.0, 0.05],
              [4.08, 0.8, 0.035],
              [5.7, 1.02, 0.045],
              [5.9, 0.8, 0.03],
            ],
          },
        ],
        items: [
          { kind: 'roundRug', x: 2.75, y: 5.0, r: 0.9, col: '#F3DDB0', line: '#FBF1D8', star: true },
          { kind: 'bed', x: 0.24, y: 3.66, w: 1.0, d: 1.95, duvet: 'blush', dots: 'cream', head: 'coralLight', headH: 0.62, sleepers: kidsBed },
          { kind: 'nightstand', x: 1.32, y: 3.68, col: 'cream' },
          { kind: 'lightBox', x: 1.5, y: 3.86, z: 0.34, light: L('kidsBox') },
          {
            kind: 'bookcase',
            facing: 'y',
            x: 2.25,
            y: 3.66,
            w: 1.25,
            d: 0.3,
            h: 0.62,
            rows: 2,
            col: 'cream',
            on: [
              { kind: 'teddy', x: 2.5, y: 3.8 },
              { kind: 'ball', x: 3.2, y: 3.82, r: 0.09, col: 'coral' },
            ],
          },
          { kind: 'teepee', x: 3.72, y: 4.25, r: 0.5 },
          { kind: 'toyBlocks', x: 2.25, y: 5.35 },
          { kind: 'ball', x: 3.1, y: 5.55, r: 0.13, col: 'blue' },
          { kind: 'chest', x: 0.2, y: 5.62, w: 0.7, d: 0.42, h: 0.3, col: 'sage', lid: 'sageDeep' },
          { kind: 'pendant', x: 2.4, y: 4.9, z: 1.3, light: L('kids'), r0: 0.16, shade: 'cream' },
        ],
        marks: [...(kidsBed.length ? [{ name: 'kid', x: 0.72, y: 4.3, z: 0.7 }] : []), { name: 'nightLight', x: 1.5, y: 3.86, z: 0.75 }],
      },
      {
        id: 'hall1',
        x: 4.4,
        y: 4.5,
        w: 3.6,
        d: 1.7,
        floor: 'wood',
        gapX: [5.0, 5.75],
        gapY: [6.95, 7.6],
        tall: [
          [4.55, 4.62, 0.85, 1.45, 0.68],
          [7.4, 4.6, 0.45, 0.45, 0.9],
        ],
        items: [
          { kind: 'stairs', x: 4.55, y: 4.62, w: 0.85, d: 1.45, n: 5 },
          { kind: 'rug', x: 5.75, y: 5.05, w: 1.6, d: 0.62, col: 'sageLight', pattern: 'stripes', line: 'cream', r: 0.06 },
          { kind: 'plant', x: 7.62, y: 4.82, plant: 'tree', k: 0.62, pot: 'cream' },
          { kind: 'pendant', x: 6.4, y: 5.35, z: 1.25, light: L('hall1'), r0: 0.13 },
          ...placed(P.hall1),
        ],
      },
    ],
  };

  const second: HouseFloor = {
    id: 'second',
    w: 8,
    d: 6.2,
    front: {
      y: [wall(0, 1.4), glass(1.4, 3.0), wall(3.0, 5.8), glass(5.8, 7.0), wall(7.0, 8)],
      x: [wall(0, 1.0), glass(1.0, 2.4), wall(2.4, 6.2)],
    },
    rooms: [
      {
        id: 'office',
        x: 0,
        y: 0,
        w: 4.5,
        d: 3.5,
        floor: 'wood',
        wall: '#E4EBEE',
        walls: [
          { kind: 'window', wall: 'x', from: 1.0, to: 2.25, z0: 0.46, z1: 1.2, panes: 3 },
          { kind: 'frame', wall: 'y', from: 0.3, z: 0.72, w: 0.5, h: 0.5, art: 'lines', frame: 'ink' },
          {
            kind: 'pinboard',
            x0: 3.32,
            x1: 4.22,
            z0: 0.7,
            z1: 1.26,
            notes: [
              [3.42, 1.0, 'mustard'],
              [3.66, 1.04, 'coralLight'],
              [3.9, 0.98, 'white'],
              [3.5, 0.8, 'white'],
              [3.8, 0.78, 'blue'],
            ],
          },
        ],
        items: [
          { kind: 'rug', x: 1.0, y: 0.95, w: 2.6, d: 1.7, col: 'blue', pattern: 'stripes', line: '#C9D8E2', r: 0.08 },
          {
            kind: 'table',
            x: 1.2,
            y: 0.08,
            w: 1.95,
            d: 0.76,
            h: 0.44,
            r: 0.05,
            bias: -0.3,
            on: [
              { kind: 'monitor', x: 2.2, y: 0.3, w: 0.66, on: !!S.monitor },
              { kind: 'laptop', x: 1.36, y: 0.36, on: !!S.laptop },
              { kind: 'mug', x: 2.86, y: 0.6, col: 'coral' },
              { kind: 'tableLamp', x: 2.95, y: 0.26, light: L('office'), base: 'graphite' },
              { kind: 'speaker', x: 1.9, y: 0.2, w: 0.13, d: 0.13, h: 0.17, col: 'ink', playing: !!sonos.office },
              { kind: 'block', x: 1.95, y: 0.56, w: 0.5, d: 0.14, h: 0.015, r: 0.03, col: 'steel' },
            ],
          },
          { kind: 'chair', x: 1.98, y: 1.02, dir: 'S', col: 'graphite', seat: 'coral', person: P.office?.[0] },
          { kind: 'bookcase', facing: 'x', x: 0.02, y: 2.4, w: 0.34, d: 1.0, h: 1.1, rows: 4 },
          { kind: 'dresser', facing: 'y', x: 3.3, y: 0.05, w: 0.92, d: 0.5, h: 0.42, col: 'cream', on: [{ kind: 'printer', x: 3.42, y: 0.14 }] },
          { kind: 'plant', x: 4.08, y: 3.05, plant: 'monstera', k: 0.95, pot: 'cream' },
          { kind: 'paperBin', x: 0.5, y: 0.45 },
          { kind: 'pendant', x: 2.3, y: 1.9, z: 1.34, light: L('officeMain'), r0: 0.16 },
        ],
      },
      {
        id: 'study',
        x: 4.5,
        y: 0,
        w: 3.5,
        d: 3.5,
        floor: 'wood',
        wall: '#F2E9DA',
        gapX: [2.45, 3.2],
        walls: [
          { kind: 'window', wall: 'y', from: 6.95, to: 7.8, z0: 0.5, z1: 1.22, panes: 2, curtain: 'linen' },
          {
            kind: 'shelf',
            wall: 'y',
            from: 4.75,
            to: 6.65,
            z: 1.0,
            on: [
              { kind: 'books', x: 4.85, y: 0.06, cols: ['blue', 'coral', 'cream', 'mustard'] },
              { kind: 'plant', x: 5.5, y: 0.12, plant: 'trail' },
              { kind: 'orb', x: 6.0, y: 0.12, col: 'blueDeep' },
              { kind: 'books', x: 6.25, y: 0.06, cols: ['terracotta', 'sage'] },
            ],
          },
          { kind: 'lightStrip', x0: 4.75, x1: 6.65, z: 0.975, light: L('study') },
        ],
        items: [
          {
            kind: 'sofa',
            facing: 'y',
            x: 4.72,
            y: 0.05,
            w: 2.0,
            d: 0.92,
            col: 'blush',
            pillows: [
              [0.1, 'mustard'],
              [0.75, 'cream'],
            ],
            people: P.study ?? [],
          },
          { kind: 'floorLamp', x: 6.9, y: 0.38, light: L('studyLamp') },
          { kind: 'roundRug', x: 6.15, y: 2.1, r: 0.85, col: 'sageLight', line: 'cream' },
          { kind: 'armchair', x: 6.85, y: 1.5, col: 'terracotta', pillow: 'cream' },
          { kind: 'roundTable', x: 6.2, y: 2.05, r: 0.26, h: 0.34, on: [{ kind: 'mug', x: 6.2, y: 2.05, col: 'white' }] },
          { kind: 'bookcase', facing: 'y', x: 4.7, y: 2.95, w: 1.5, d: 0.32, h: 0.5, rows: 2, col: 'oak', bias: 0.2, on: [{ kind: 'plant', x: 5.1, y: 3.1, plant: 'cactus' }] },
        ],
      },
      {
        id: 'den',
        x: 0,
        y: 3.5,
        w: 4.5,
        d: 2.7,
        floor: 'wood',
        wall: '#DDD9E6',
        tall: [
          [2.95, 3.56, 1.3, 0.32, 0.8],
          [3.85, 3.6, 0.5, 0.5, 0.95],
        ],
        walls: [
          { kind: 'frame', wall: 'x', from: 5.62, z: 0.66, w: 0.44, h: 0.58, art: 'blocks', frame: 'ink' },
          { kind: 'frame', wall: 'x', from: 3.62, z: 0.76, w: 0.38, h: 0.46, art: 'arch', frame: 'ink' },
        ],
        items: [
          { kind: 'rug', x: 0.75, y: 3.85, w: 2.9, d: 2.05, col: '#B7C4D2', pattern: 'diamond', line: '#D5DEE7' },
          { kind: 'tv', wall: 'x', from: 4.1, to: 5.5, z0: 0.6, z1: 1.22, state: S.denTv ?? 'off' },
          {
            kind: 'sideboard',
            facing: 'x',
            x: 0.03,
            y: 4.0,
            w: 0.4,
            d: 1.6,
            h: 0.31,
            col: 'walnut',
            bias: -2,
            on: [
              { kind: 'speaker', x: 0.24, y: 4.8, w: 0.12, d: 0.6, h: 0.07, col: 'ink', playing: !!sonos.den },
              { kind: 'block', x: 0.12, y: 4.12, w: 0.2, d: 0.26, h: 0.06, r: 0.03, col: 'white' },
            ],
          },
          { kind: 'beanbag', x: 1.75, y: 4.45, col: 'blueDeep', k: 1.05 },
          { kind: 'beanbag', x: 2.05, y: 5.4, col: 'mustard', k: 0.95 },
          {
            kind: 'roundTable',
            x: 1.05,
            y: 5.0,
            r: 0.28,
            h: 0.2,
            col: 'cream',
            on: [
              { kind: 'block', x: 0.95, y: 4.92, w: 0.16, d: 0.1, h: 0.03, r: 0.03, col: 'ink' },
              { kind: 'bowl', x: 1.12, y: 5.08, fruit: false },
            ],
          },
          { kind: 'bookcase', facing: 'y', x: 2.95, y: 3.56, w: 1.3, d: 0.32, h: 0.78, rows: 3, col: 'ink' },
          { kind: 'cupboard', x: 3.85, y: 3.6, w: 0.5, d: 0.5, h: 0.56, col: 'cream', on: [{ kind: 'plant', x: 4.1, y: 3.85, plant: 'cactus' }] },
          { kind: 'floorLamp', x: 4.1, y: 5.85, light: L('den'), shade: 'mustard' },
          ...placed(P.den),
        ],
      },
      {
        id: 'hall2',
        x: 4.5,
        y: 3.5,
        w: 3.5,
        d: 2.7,
        floor: 'wood',
        gapX: [4.35, 5.2],
        gapY: [5.25, 6.0],
        tall: [
          [7.3, 3.6, 0.6, 0.6, 0.82],
          [5.85, 5.2, 1.0, 0.6, 0.76],
        ],
        items: [
          { kind: 'stairwell', x: 4.66, y: 3.66, w: 0.84, d: 1.44, steps: 5 },
          { kind: 'washer', x: 7.3, y: 3.6, running: !!S.washer, on: [{ kind: 'block', x: 7.38, y: 3.7, w: 0.4, d: 0.3, h: 0.1, r: 0.05, col: 'blush', soft: 0.4 }] },
          { kind: 'dryingRack', x: 5.85, y: 5.2 },
          { kind: 'basket', x: 7.2, y: 4.6, r: 0.22, h: 0.34 },
          {
            kind: 'boxStack',
            x: 7.2,
            y: 5.4,
            w: 0.6,
            d: 0.5,
            layers: [
              { h: 0.26, col: 'linenDeep' },
              { h: 0.22, col: 'sage', inset: 0.04 },
            ],
          },
          { kind: 'pendant', x: 6.3, y: 4.4, z: 1.25, light: L('hall2'), r0: 0.13 },
        ],
      },
    ],
  };
  return [ground, first, second];
}

/** The example home's garden, drive and car. */
export function homePlot(S: HomeState): Plot {
  const garden = !!S.lights?.garden?.[0];
  const car = S.car ?? 'home';
  const marks: Mark[] = [
    { name: 'heatPump', x: 0.06, y: 6.95, z: 0.95 },
    { name: 'frontDoor', x: 6.9, y: 6.52, z: 1.15 },
  ];
  if (car !== 'away') marks.push({ name: 'car', x: 9.55, y: 4.2, z: 1.0 });
  const front: Item[] = [
    { kind: 'heatPump', x: -0.42, y: 6.55, running: !!S.heatPump },
    { kind: 'gardenSeat', x: 1.2, y: 6.62 },
    { kind: 'roundTable', x: 2.75, y: 7.0, r: 0.3, h: 0.32, col: 'cream', on: [{ kind: 'plant', x: 2.75, y: 7.0, plant: 'herb' }] },
    { kind: 'gardenSeat', x: 3.2, y: 6.62 },
    { kind: 'stringLights', x0: 0.95, x1: 4.1, y: 7.55, on: garden },
    { kind: 'shrub', x: 4.75, y: 6.75, k: 1.0 },
    { kind: 'shrub', x: 5.3, y: 7.4, k: 0.8, col: 'leaf2' },
    { kind: 'shrub', x: 7.3, y: 6.9, k: 1.1, col: 'leafDark' },
    { kind: 'shrub', x: 7.85, y: 7.5, k: 0.75 },
    { kind: 'bollard', x: 5.55, y: 7.85, on: garden },
    { kind: 'bollard', x: 7.0, y: 7.75, on: garden },
    { kind: 'lantern', x: 6.9, y: 6.52, on: !!S.lights?.frontDoor?.[0] },
    { kind: 'frontDoor', x: 5.8, y: 6.34, z: 0.3 },
    { kind: 'wallbox', x: 8.3, y: 6.0, state: car === 'charging' ? 'charging' : car === 'waiting' ? 'waiting' : 'idle' },
    ...(car !== 'away' ? [{ kind: 'car', x: 8.75, y: 2.45, state: car, cable: car !== 'home' ? ([8.3, 6.0] as const) : null } as Item] : []),
    { kind: 'bin', x: 8.55, y: 0.5, col: 'sageDeep' },
    { kind: 'bin', x: 9.0, y: 0.5, col: 'graphite' },
  ];
  return {
    lawn: { x: -0.6, y: -0.6, w: 11.5, d: 8.7, r: 0.6 },
    drive: { x: 8.4, y: 0.2, w: 2.3, d: 7.75, r: 0.12 },
    deck: { x: 0.9, y: 6.42, w: 3.2, d: 1.18, r: 0.06 },
    stones: [6.5, 7.0, 7.5].map((y) => ({ x: 6.02, y, w: 0.5, d: 0.36, r: 0.08 })),
    behind: [
      { kind: 'gardenTree', x: -0.55, y: 2.9, k: 1.25 },
      { kind: 'gardenTree', x: 3.1, y: -0.6, k: 1.1 },
      { kind: 'shrub', x: 6.6, y: -0.5, k: 1.3, col: 'leafDark' },
    ],
    front,
    marks,
  };
}

/** The example home as a scene: a state (by name or given), and what to show. */
export function homeScene(state: HomeStateName | HomeState, o: Omit<HouseScene, 'floors' | 'plot' | 'candles'> & { plot?: boolean } = {}): HouseScene {
  const S: HomeState = typeof state === 'string' ? HOME_STATES[state] : state;
  const { plot, ...rest } = o;
  return { floors: homeFloors(S), plot: plot ? homePlot(S) : undefined, candles: !!S.candles, ...rest };
}

