/**
 * @file small.ts
 * @description Example close-ups as data: small scenes on a slab (a car at its charger, two battery packs and the inverter, a heat pump outside a cut wall with the tank and the ventilation inside) and single pieces for a builder's tray (sofa, table, bed, island, bath, desk, plant, lamp). They show close-up mode with a slab, a lowered ground, paving joints and a lawn patch, and are fixtures of the tests and the visual comparison.
 * Ported from hearth-concept/clay2/extras.js (VIGNETTES, thumb).
 * Used by: house.test.ts, scripts/house-pictures.ts.
 */
import { BASE_COLORS, dk } from '../colors';
import type { CloseupScene } from '../closeup';
import type { Item } from '../items';
import type { TimeOfDay } from '../stage';

/** The car on the drive at the wall box. */
export function carScene(car: 'home' | 'waiting' | 'charging', time: TimeOfDay = 'day'): CloseupScene {
  return {
    extent: { x0: -0.3, y0: -0.3, x1: 3.2, y1: 4.7, zt: 1.25 },
    slab: { x: -0.3, y: -0.3, w: 3.5, d: 5.0, r: 0.5, z: -0.3, h: 0.16, top: 'paver', side: dk(BASE_COLORS.paver, 0.1), joints: { step: 0.42, x0: 0.1, y0: 0 } },
    ground: 0.14,
    items: [
      { kind: 'shrub', x: 0.15, y: 0.25, k: 0.9, col: 'leafDark' },
      { kind: 'car', x: 1.15, y: 0.35, state: car, cable: car !== 'home' ? [0.35, 4.05] : null },
      { kind: 'wallbox', x: 0.35, y: 4.05, state: car === 'home' ? 'idle' : car },
      { kind: 'lantern', x: 0.05, y: 2.6, lit: time !== 'day' },
    ],
  };
}

/** Two battery packs, their charge (0 to 1), and the inverter. */
export function batteryScene(soc: readonly [number, number]): CloseupScene {
  return {
    extent: { x0: 0, y0: 0, x1: 2.7, y1: 1.5, zt: 1.15 },
    slab: { x: 0, y: 0, w: 2.7, d: 1.5, r: 0.3, z: -0.16, h: 0.16, top: 'concrete', side: dk(BASE_COLORS.concrete, 0.08) },
    items: [
      { kind: 'pipe', pts: [[1.4, 0.66, 0.5], [1.52, 0.66, 0.5], [1.52, 0.66, 0.3], [1.62, 0.66, 0.3]], col: 'ink', w: 2, bias: -10 },
      { kind: 'battery', x: 0.28, y: 0.42, soc: soc[0] },
      { kind: 'battery', x: 0.88, y: 0.42, soc: soc[1] },
      { kind: 'inverter', x: 1.62, y: 0.5 },
      { kind: 'plant', x: 2.35, y: 0.3, plant: 'snake', pot: 'cream', k: 0.8 },
    ],
  };
}

/** Outside the heat pump, inside the hot water tank and the ventilation box, a cut wall between. */
export function heatScene(o: { running: boolean; tank: number; vent: number }): CloseupScene {
  const pipes = (x0: number, x1: number, at: readonly [number, number], bias: number): Item[] => [
    { kind: 'pipe', pts: [[x0, 1.05, 0.5], [x1, 1.05, 0.5]], col: 'coralLight', w: 2.4, at, bias },
    { kind: 'pipe', pts: [[x0, 1.05, 0.38], [x1, 1.05, 0.38]], col: 'blue', w: 2.4, at, bias },
  ];
  return {
    extent: { x0: 0, y0: 0, x1: 4.4, y1: 1.9, zt: 1.5 },
    slab: { x: 0, y: 0, w: 4.4, d: 1.9, r: 0.3, z: -0.16, h: 0.16, top: 'wood', side: 'plinth', patch: { x0: -0.1, y0: -0.1, x1: 1.95, y1: 2, col: 'lawn' } },
    items: [
      { kind: 'wallStub', x: 1.9, y: 0, w: 0.14, d: 1.9, h: 0.36, bias: -10 },
      { kind: 'shrub', x: 0.3, y: 0.35, k: 0.8 },
      { kind: 'heatPump', x: 0.42, y: 0.75, running: o.running },
      ...pipes(1.38, 1.9, [1.8, 1.2], 2),
      ...pipes(2.04, 2.5, [2.3, 1.2], -0.5),
      { kind: 'tank', x: 2.78, y: 1.05, heat: o.tank },
      { kind: 'ventBox', x: 3.5, y: 0.5, level: o.vent },
      { kind: 'rug', x: 3.3, y: 1.2, w: 0.9, d: 0.5, col: 'blush', line: 'cream', r: 0.08 },
    ],
  };
}

/** The pieces of a builder's tray. */
export type TrayPiece = 'Sofa' | 'Table' | 'Bed' | 'Island' | 'Bath' | 'Desk' | 'Plant' | 'Lamp';

const TRAY: Record<TrayPiece, { items: Item[]; w: number; d: number; zt: number }> = {
  Sofa: {
    items: [
      {
        kind: 'sofa',
        facing: 'y',
        x: 0,
        y: 0,
        w: 1.9,
        d: 0.92,
        col: 'linen',
        pillows: [
          [0.1, 'mustard'],
          [0.75, 'coralLight'],
        ],
      },
    ],
    w: 1.9,
    d: 0.92,
    zt: 0.72,
  },
  Table: {
    items: [
      { kind: 'table', x: 0, y: 0.4, w: 1.5, d: 0.85, h: 0.42, r: 0.18 },
      { kind: 'chair', x: 0.25, y: 0, dir: 'N', col: 'walnut', seat: 'linen' },
      { kind: 'chair', x: 0.9, y: 0, dir: 'N', col: 'walnut', seat: 'linen' },
    ],
    w: 1.5,
    d: 1.25,
    zt: 0.72,
  },
  Bed: { items: [{ kind: 'bed', x: 0, y: 0, w: 1.5, d: 2.0, duvet: 'sageLight', throwCol: 'mustard' }], w: 1.5, d: 2.05, zt: 0.85 },
  Island: { items: [{ kind: 'island', x: 0, y: 0, w: 1.5, d: 0.78, on: [{ kind: 'bowl', x: 0.5, y: 0.4 }] }], w: 1.5, d: 0.8, zt: 0.6 },
  Bath: { items: [{ kind: 'bath', x: 0, y: 0, w: 1.75, d: 0.85 }], w: 1.75, d: 0.85, zt: 0.62 },
  Desk: {
    items: [
      {
        kind: 'table',
        x: 0,
        y: 0,
        w: 1.6,
        d: 0.72,
        h: 0.44,
        r: 0.05,
        on: [
          { kind: 'monitor', x: 0.8, y: 0.22, w: 0.6 },
          { kind: 'mug', x: 1.35, y: 0.5, col: 'coral' },
        ],
      },
      { kind: 'chair', x: 0.62, y: 0.86, dir: 'S', col: 'graphite', seat: 'coral' },
    ],
    w: 1.6,
    d: 1.25,
    zt: 0.95,
  },
  Plant: { items: [{ kind: 'plant', x: 0.3, y: 0.3, plant: 'monstera', k: 1.2 }], w: 0.6, d: 0.6, zt: 1.05 },
  Lamp: { items: [{ kind: 'floorLamp', x: 0.3, y: 0.3 }], w: 0.6, d: 0.6, zt: 1.3 },
};

/** A single piece for a builder's tray, floating without a shadow under it all. */
export function trayScene(piece: TrayPiece): CloseupScene {
  const t = TRAY[piece];
  return { extent: { x0: -0.1, y0: -0.1, x1: t.w + 0.1, y1: t.d + 0.1, zt: t.zt }, items: t.items };
}

export const TRAY_PIECES = Object.keys(TRAY) as TrayPiece[];
