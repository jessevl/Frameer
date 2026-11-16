/**
 * @file colors.ts
 * @description The materials of the house pictures: the warm room colours (linen, oak, sage, blush, mustard, ...) by name, with coral taken from the theme's clay palette so the accent follows the tokens, and the small colour helpers the engine and the objects share (lighter, darker, RGB, hex). A scene names a material (`'sage'`) or gives a hex (`'#A9B89B'`); the style layer (styles.ts) remaps either.
 * Ported from hearth-concept/clay2/engine.js (COL, lt, dk, rgbOf, rgba) and lido@frontend/src/components/pictures/colors.ts (colorsFor).
 * Used by: stage.ts, styles.ts, the objects, house.ts, closeup.ts and the examples.
 */
import { mix } from '../../icons/palette';
import type { ClayPalette } from '../clay';

/** The named materials, light theme values; coral and its steps are replaced by the theme's (colorsFor). */
export const BASE_COLORS = {
  wall: '#F6F1EA',
  cut: '#FFFDFA',
  plinth: '#D6CDC1',
  skirting: '#E6DED3',
  wood: '#E6CFAE',
  woodDeep: '#CFAE86',
  oak: '#DCC096',
  walnut: '#A67C59',
  tile: '#EEEAE4',
  grout: '#DCD6CD',
  concrete: '#D8D5CF',
  stone: '#F2EFEA',
  linen: '#E6DCCD',
  linenDeep: '#D2C5B3',
  cream: '#FBF6EE',
  white: '#FFFFFF',
  grey: '#CFCAC3',
  greyDeep: '#A8A29A',
  coral: '#E8705F',
  coralLight: '#F4A595',
  coralDeep: '#C24F3B',
  blush: '#F5D3C8',
  terracotta: '#D88D70',
  rust: '#C46F50',
  sage: '#A9B89B',
  sageDeep: '#7F9373',
  sageLight: '#CDD8C2',
  leaf: '#86A277',
  leaf2: '#A9C095',
  leafDark: '#6C8A63',
  blue: '#9DB4C4',
  blueDeep: '#6F8DA4',
  sky: '#CFE1EA',
  water: '#BCDCE7',
  glass: '#DDEBF1',
  navy: '#3E4E68',
  mustard: '#E6C06E',
  ochre: '#D4A657',
  lilac: '#C9C0DA',
  ink: '#3B3633',
  graphite: '#5B5551',
  steel: '#CBC9C5',
  chrome: '#E3E2DF',
  skin: '#EBCFB8',
  hairA: '#6B4E3D',
  hairB: '#C7A268',
  hairC: '#3F3430',
  lawn: '#B9CCA3',
  lawnDeep: '#A5BB8E',
  paver: '#DAD5CD',
} as const;

/** A material's name. */
export type MaterialName = keyof typeof BASE_COLORS;

/** The materials in use: every name to a `#RRGGBB` hex. */
export type Colors = Record<MaterialName, string>;

/** A colour in a scene: a material's name or a `#RRGGBB` hex. */
export type Paint = MaterialName | `#${string}`;

/** A light's colour, 0 to 255 per channel. */
export type RGB = readonly [number, number, number];

/** Lamp light. */
export const WARM: RGB = [255, 196, 140];

const HEX = /^#[0-9a-f]{6}$/i;

/** Whether a string is a plain `#RRGGBB` hex (the only colours the style layer remaps). */
export const isHex = (c: string): boolean => HEX.test(c);

/** The materials for a theme's palette: coral from the theme when it is a plain hex, every other material fixed. */
export function colorsFor(pal?: Pick<ClayPalette, 'coral' | 'coralLight' | 'coralDeep'>): Colors {
  const base: Colors = { ...BASE_COLORS };
  if (!pal) return base;
  const coral = isHex(pal.coral) ? pal.coral.toUpperCase() : base.coral;
  return {
    ...base,
    coral,
    coralLight: isHex(pal.coralLight) ? pal.coralLight.toUpperCase() : mix(coral, '#FFFFFF', 0.35),
    coralDeep: isHex(pal.coralDeep) ? pal.coralDeep.toUpperCase() : base.coralDeep,
  };
}

/** Lighter by t (0 to 1). Plain hex stays hex. */
export const lt = (c: string, t: number): string => mix(c, '#FFFFFF', t);
/** Darker by t (0 to 1). */
export const dk = (c: string, t: number): string => mix(c, '#000000', t);

export function rgbOf(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export const rgba = (hex: string, a: number): string => `rgba(${rgbOf(hex).join(',')},${a})`;

/** An RGB colour as hex, moved toward white by w (0 to 1). */
export function hexOf(col: RGB, w = 0): string {
  return '#' + col.map((v) => Math.round(v + (255 - v) * w).toString(16).padStart(2, '0')).join('').toUpperCase();
}

/** Clamped hex of three channels. */
export function toHex(a: readonly number[]): string {
  return '#' + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
}

/** Perceived lightness, 0 to 1. */
export function lum(hex: string): number {
  const [r, g, b] = rgbOf(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
