/**
 * @file kit.ts
 * @description The pieces every Drift line drawing is made of: the kit a drawing receives (stroke width, occluding shapes, open strokes, flat tints), the drawing and definition types, and the small shared shapes (circles, rounded rectangles, the folder, the calendar head, the hills of a photo). Plain strings, so the drawings run in Node too.
 * Used by: the drawing groups in this folder and line.ts.
 */
import { rr } from '../glass.ts';

export { rr };

/** What a drawing may use: a stroke width and the paints that depend on the instance. */
export interface LineKit {
  /** The id prefix of this instance. */
  p: string;
  /** The line width. */
  sw: number;
  /** A closed shape: occluding fill, frosted tint, outline; `fon` also adds a coral fill that shows on hover or when set. */
  g: (d: string, cls?: string, fon?: boolean) => string;
  /** The same without the outline (a backdrop for a stroke). */
  back: (d: string) => string;
  /** An open stroke. */
  i: (d: string, w?: number, cls?: string, col?: string) => string;
  /** Flat tints of `currentColor`: 16, 30 and 55 percent. */
  faint: string;
  soft: string;
  mid: string;
}

export type Draw = (h: LineKit) => string;

export interface LineDef {
  /** The spoken name (the label when the icon is not decorative). */
  name: string;
  /** Always coral (the create button and the sync mark). */
  fixed?: boolean;
  draw: Draw;
}

/** A circle as a path, so it can take the occluding fill and the outline of `g`. */
export const C24 = (cx: number, cy: number, r: number) => `M${cx - r},${cy}a${r},${r} 0 1 0 ${2 * r},0a${r},${r} 0 1 0 ${-2 * r},0Z`;

/** A stroke at reduced opacity (the faint ticks of Agenda and Visual): `i` has no opacity. */
export const dim = (d: string, w: number, op: number, cls = '') => `<path class="${cls}" d="${d}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-opacity="${op}" stroke-linecap="round" stroke-linejoin="round"/>`;

/** A solid currentColor shape; the class names the part that moves. */
export const solid = (d: string, cls = '') => `<path class="${cls}" d="${d}" fill="currentColor"/>`;

/** A solid dot. */
export const dot = (cx: number, cy: number, r: number, cls = '', fill = 'currentColor') => `<circle${cls ? ` class="${cls}"` : ''} cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;

/** A stroke that draws itself on hover (`.ink`): its length is normalized to 10, so one dash rule fits every path. */
export const ink = (h: LineKit, d: string, w = h.sw, cls = '') => `<path class="ink${cls ? ` ${cls}` : ''}" pathLength="10" d="${d}" fill="none" stroke="currentColor" stroke-width="${Math.min(w, h.sw + 0.6)}" stroke-linecap="round" stroke-linejoin="round"/>`;

/** A group whose class names the part that moves. */
export const part = (cls: string, inner: string) => `<g class="${cls}">${inner}</g>`;

export const FOLDER_BACK = 'M3 18V6a1.5 1.5 0 0 1 1.5-1.5h4l2 2h9A1.5 1.5 0 0 1 21 8v10Z';
export const FOLDER_FRONT = 'M3 19.5h18l-1.2-9H4.2Z';
export const folderBack = (h: LineKit) => `<path d="${FOLDER_BACK}" fill="${h.faint}" stroke="currentColor" stroke-width="${h.sw}" stroke-linejoin="round"/>`;
export const PHOTO_HILLS = 'M4.2 18.8 9 13.8l3.3 3.3 2.2-2.2 5.3 4.6Z';

/** The calendar: a rounded sheet with a solid head and two rings. */
export const calendarHead = (h: LineKit) => h.g(rr(3, 4.5, 18, 16.5, 3.2))
  + '<path d="M6.2 4.5h11.6a3.2 3.2 0 0 1 3.2 3.2V10H3V7.7a3.2 3.2 0 0 1 3.2-3.2Z" fill="currentColor"/>'
  + h.i('M8 2.6v3.4M16 2.6v3.4');

/** A page with rounded corners (the Pages drawing's front sheet, a little narrower). */
export const sheet = (h: LineKit, cls = '') => h.g(rr(4.5, 2.6, 15, 18.8, 3), cls);
