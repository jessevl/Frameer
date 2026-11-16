/**
 * @file outline.ts
 * @description An example house drawn from room outlines: an L-shaped living room with an angled corner, a kitchen and
 * a hall that leave the corner of the plot open, doors (hinged, sliding and double, the front door in its own colour),
 * windows over sills, a glass door to the garden and an open passage, and a sofa and a table turned on the plan, a radiator, a boiler and a frame hung on the angled wall. It is
 * the fixture of the outline floor's tests and shows the shape of `outline` and `openings` for an app's builder.
 * Used by: house.test.tsx, scripts/house-pictures.ts.
 */
import type { HouseFloor, HouseScene, Opening } from '../house';

const living: [number, number][] = [
  [0, 0],
  [4.6, 0],
  [4.6, 2.6],
  [3.2, 2.6],
  [3.2, 5.4],
  [0.8, 5.4],
  [0, 4.6],
];

/** The openings of the example's ground floor. */
export const OUTLINE_OPENINGS: Opening[] = [
  { a: [1.0, 0], b: [2.4, 0], kind: 'window' },
  { a: [0, 1.2], b: [0, 2.6], kind: 'window', sill: 0.3 },
  { a: [3.2, 3.2], b: [3.2, 4.1], kind: 'door', hinge: 'a', side: 1 },
  { a: [4.6, 0.6], b: [4.6, 1.8], kind: 'passage' },
  { a: [5.2, 2.6], b: [6.0, 2.6], kind: 'door', style: 'sliding' },
  { a: [1.4, 5.4], b: [2.8, 5.4], kind: 'glass' },
  { a: [3.6, 5.4], b: [4.6, 5.4], kind: 'door', col: 'coral', hinge: 'b', side: -1 },
  { a: [7.6, 0.8], b: [7.6, 2.0], kind: 'door', style: 'double' },
];

/** The ground floor: an L with an angled corner, a kitchen and a hall. */
export function outlineFloor(): HouseFloor {
  return {
    id: 'ground',
    w: 7.6,
    d: 5.4,
    rooms: [
      {
        id: 'living',
        x: 0,
        y: 0,
        w: 4.6,
        d: 5.4,
        floor: 'wood',
        outline: living,
        items: [
          { kind: 'sofa', facing: 'y', x: 0.5, y: 3.1, w: 1.9, d: 0.92, col: 'linen', turn: 90 },
          { kind: 'table', x: 1.4, y: 0.8, w: 1.4, d: 0.8, h: 0.42, turn: 30 },
          { kind: 'pendant', x: 2.1, y: 1.2, z: 1.2, light: { level: 0.7 } },
          { kind: 'radiator', x: 2.6, y: 0.05, w: 1.0, warm: 0.6 },
          { kind: 'frame', wall: 'y', from: 0.2, z: 0.6, w: 0.5, h: 0.4, art: 'hills', moved: { x: 0.8, y: 5.4, turn: -135 } },
        ],
      },
      { id: 'kitchen', x: 4.6, y: 0, w: 3.0, d: 2.6, floor: 'tile', outline: [[4.6, 0], [7.6, 0], [7.6, 2.6], [4.6, 2.6]], items: [{ kind: 'island', x: 5.3, y: 0.9, w: 1.4, d: 0.7 }] },
      { id: 'hall', x: 3.2, y: 2.6, w: 3.4, d: 2.8, floor: 'tile', outline: [[3.2, 2.6], [6.6, 2.6], [6.6, 4.0], [4.6, 4.0], [4.6, 5.4], [3.2, 5.4]], items: [{ kind: 'boiler', x: 5.9, y: 2.65, on: true }] },
    ],
    openings: OUTLINE_OPENINGS,
  };
}

/** The example as a scene, at night by default so the lamp shows. */
export function outlineScene(o: Omit<HouseScene, 'floors'> = {}): HouseScene {
  return { floors: [outlineFloor()], ...o };
}
