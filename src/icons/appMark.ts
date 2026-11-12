/**
 * @file appMark.ts
 * @description The recipe every suite app's mark shares (Drift's sync D, Yard's Y and container): the cream ink and coral glass of the inverted and small drawings, the coral front (the standard card's glass with a coral body and softened highlights), the home-screen tile behind the backdrop and maskable variants, and the monochrome frame. Each app keeps only its own glyph, its sheets and its pixel drawing.
 * Plain strings, so the apps' icon scripts run it in Node.
 * Used by: Drift's items/icons/appIcon.ts and Yard's icons/markDrawings.ts (and through them their render-app-icons scripts and the marks in the rail).
 */
import { glass, SHAPES } from './glass.ts';
import { CORAL_PALETTE } from './palette.ts';

/** The glyph's ink on a coral front and on the small drawings. */
export const MARK_CREAM = '#FFF7F1';
/** The coral front and the flat card, top to bottom. */
export const MARK_CORAL = ['#EF7A61', '#B9432F'] as const;
/** How much of the glass highlights (specular, sweep, rim, top edge) the coral front keeps. */
const SOFT_HIGHLIGHTS = 0.55;

/** A top-to-bottom coral gradient under this id, in its own `<defs>`. */
export const coralGradient = (id: string) =>
  `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${MARK_CORAL[0]}"/><stop offset="1" stop-color="${MARK_CORAL[1]}"/></linearGradient></defs>`;

/** The standard card's glass in coral: its body painted by `${p}cbody` (draw `coralGradient(`${p}cbody`)` beside it), the highlights softened. Needs the glass `defs` of the coral palette. */
export const coralFront = (p: string) =>
  glass(p, CORAL_PALETTE, SHAPES.std).replace(`url(#${p}body)`, `url(#${p}cbody)`).replace('<g clip-path', `<g opacity="${SOFT_HIGHLIGHTS}" clip-path`);

/**
 * The home-screen tile: the coral gradient, a bloom and a vignette. `backdrop` is the rounded tile; `maskable` is full bleed with the card inside the safe zone.
 * `transform` places the mark's group (the full drawing on its 512 grid) on the tile.
 */
export function homeTile(p: string, variant: 'backdrop' | 'maskable'): { tile: string; transform: string } {
  const radius = variant === 'maskable' ? 0 : 116;
  const fit = variant === 'maskable' ? 0.74 : 0.9;
  const fill = (id: string) => `<rect width="512" height="512" rx="${radius}" fill="url(#${p}${id})"/>`;
  const gradients = `<defs><linearGradient id="${p}bg" x1="46" y1="0" x2="470" y2="512" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFAE95"/><stop offset=".35" stop-color="#FA8A72"/><stop offset=".7" stop-color="#F0705A"/><stop offset="1" stop-color="#DD5540"/></linearGradient><radialGradient id="${p}bloom" cx=".26" cy=".02" r=".8"><stop offset="0" stop-color="#FFEFE6" stop-opacity=".42"/><stop offset=".5" stop-color="#FFD2C0" stop-opacity=".12"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient><radialGradient id="${p}vig" cx=".5" cy=".42" r=".82"><stop offset=".65" stop-color="#9A3221" stop-opacity="0"/><stop offset="1" stop-color="#9A3221" stop-opacity=".08"/></radialGradient></defs>`;
  return { tile: `${gradients}${fill('bg')}${fill('bloom')}${fill('vig')}`, transform: `translate(256 256) scale(${fit * 1.14}) translate(-256 -256)` };
}

/** The monochrome variant's frame: the card's outline in one ink. */
export const monoFrame = (ink: string, width: number) => `<rect x="96" y="92" width="320" height="328" rx="62" fill="none" stroke="${ink}" stroke-width="${width}"/>`;
