/**
 * @file draw.ts
 * @description Assembles a glass icon from the kit: the parts of a kind (what is behind the card, the glass front, the marks, whether the front is a folder pocket that tips open) and the whole SVG as a string. React draws the same parts (GlassIcon) so a custom icon can sit on the card inside the pocket's group; Node draws the string (app icons, section pictures for the PWA shortcuts).
 * Used by: GlassIcon, appIcon.ts, scripts/render-app-icons.mjs.
 */
import { behind, BOOK, defs, folderBack, glass, SHAPES, type Layout } from './glass.ts';
import { KIND_ART, type KindKey } from './kinds.ts';
import { paletteOf, type Palette } from './palette.ts';

/** Sizes up to this many pixels use the small drawing (fewer, thicker marks). */
export const SMALL_MAX = 32;

export const isSmall = (size: number | null) => size !== null && size <= SMALL_MAX;

export interface KindParts {
  /** Sheets, the folder back and its papers, the e-book's second page. */
  before: string;
  /** Whether the front is a folder pocket (it and its marks tip open together). */
  pocket: boolean;
  front: string;
  marks: string;
}

export function kindParts(kind: KindKey, p: string, c: Palette, small: boolean, layout: Layout | null): KindParts {
  const art = KIND_ART[kind];
  const marks = art.marks(p, c, small);
  if (art.shape === 'folder') return { before: folderBack(p, c, layout === 'papers', small), pocket: true, front: glass(p, c, SHAPES.pocket), marks };
  const shape = SHAPES[art.shape];
  const sheets = layout && shape.rect ? behind(p, shape.rect, layout, small) : '';
  const book = art.shape === 'book' ? `<path d="${BOOK}" transform="translate(0 22)" fill="url(#${p}s2)"/>` : '';
  return { before: sheets + book, pocket: false, front: glass(p, c, shape), marks };
}

/** Where a custom icon sits on the card, in the 512 grid: centered on the part of the shape that faces you. */
export function customMarkBox(kind: KindKey, small: boolean): { cx: number; cy: number; scale: number; strokeWidth: number } {
  const shape = KIND_ART[kind].shape;
  const [cx, cy, scale] = shape === 'folder' ? [256, 318, small ? 6.6 : 5.8] : shape === 'land' ? [256, 256, small ? 8.6 : 7.6] : [256, 256, small ? 9.4 : 8.4];
  return { cx, cy, scale, strokeWidth: small ? 2.6 : 2 };
}

/** The group that scales the drawing to fill the box and casts the warm shadow. */
export const groupTransform = (small: boolean) => `translate(256,256) scale(${small ? 1.2 : 1.14}) translate(-256,-256)`;

const attrs = (size: number | null, cls: string) => `${size ? ` width="${size}" height="${size}"` : ''}${cls ? ` class="${cls}"` : ''}`;

/** A whole glass icon as SVG markup. `base` is the color the palette derives from (a hex, or `var(--token)` in the browser). */
export function kindSvg(kind: KindKey, base: string, { size = null, layout = null, prefix = 'k', label = '', cls = '' }: { size?: number | null; layout?: Layout | null; prefix?: string; label?: string; cls?: string } = {}): string {
  const p = `${prefix}_`;
  const small = isSmall(size);
  const c = paletteOf(base);
  const { before, pocket, front, marks } = kindParts(kind, p, c, small, layout);
  const inner = pocket ? `${before}<g class="gi-pocket">${front}${marks}</g>` : `${before}${front}${marks}`;
  return `<svg${attrs(size, cls)} viewBox="0 0 512 512" fill="none"${label ? ` role="img" aria-label="${label}"` : ' aria-hidden="true"'}>${defs(p, c)}<g transform="${groupTransform(small)}" filter="url(#${p}shadow)">${inner}</g></svg>`;
}
