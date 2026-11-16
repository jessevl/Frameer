/**
 * @file suiteMark.ts
 * @description The six suite marks (Drift, Lighthouse, Harbour, Yard, Reel, Hearth) as one family, drawn by one function: each app's card takes the shape of what it is (Drift's D, Lighthouse's tower, Harbour's disc, Yard's container, Reel's ticket, Hearth's house), carries a few round-capped lines of one weight and one moving part (classes `m1` and `m2`, moved by styles/suite-mark.css), and keeps sheets behind it only where the app holds many of something (Drift, Lighthouse, Yard, Reel).
 * Variants: `full` (the glass card with its sheets and shadow, from 48 px), `backdrop` and `maskable` (the home-screen tile), `paper` (a flat white card with a coral edge: the rail, the dark tab, 32 px), `tile` (the shape itself as a coral tile with a cream drawing: the 16 px icon on a light tab), `favicon` (tile on a light tab bar, paper on a dark one, switched by the SVG itself) and `mono` (the outline for Safari's mask icon). Plain strings, so the apps' icon scripts run it in Node.
 * Used by: each app's mark component and its scripts/render-app-icons.mjs.
 */
import { coralGradient, homeTile, MARK_CREAM } from './appMark.ts';
import { groupTransform } from './draw.ts';
import { defs, glass, SHAPES, type Shape } from './glass.ts';
import { CORAL_PALETTE } from './palette.ts';

export type SuiteApp = 'drift' | 'lighthouse' | 'harbour' | 'yard' | 'reel' | 'hearth';
export type SuiteVariant = 'full' | 'backdrop' | 'maskable' | 'paper' | 'tile' | 'favicon' | 'mono';
/** How the moving part moves (styles/suite-mark.css): slide, glow, enter, lift or nudge. */
export type SuiteMotion = 'slide' | 'glow' | 'enter' | 'lift' | 'nudge';

/** One part of a drawing. On the 24 grid (scaled with the glyph): a round-capped stroke `d`, a `solid` filled shape, or a `dot` [cx, cy, r]. `raw` parts are drawn on the 512 card grid at a fixed weight `w` instead. */
interface Part {
  d?: string;
  dot?: readonly [number, number, number];
  solid?: boolean;
  raw?: boolean;
  w?: number;
  cls?: string;
}

interface Def {
  name: string;
  shape: Shape;
  /** The sheets behind the card (full and backdrop only), or none. */
  sheets: keyof typeof SHEETS | null;
  /** Where the glyph's centre sits on the 512 card grid, and its scale (default 1). */
  at?: readonly [number, number, number?];
  parts: Part[];
  motion: SuiteMotion;
}

/** A polygon with rounded corners: [x, y, radius] per vertex. */
function poly(pts: readonly (readonly [number, number, number])[]): string {
  const n = pts.length;
  return (
    pts
      .map(([x, y, r], i) => {
        const [px, py] = pts[(i + n - 1) % n]!;
        const [nx, ny] = pts[(i + 1) % n]!;
        const toward = (ax: number, ay: number) => {
          const l = Math.hypot(ax - x, ay - y);
          return [x + ((ax - x) / l) * r, y + ((ay - y) / l) * r].map((v) => +v.toFixed(1));
        };
        return `${i ? 'L' : 'M'}${toward(px, py)} Q${x},${y} ${toward(nx, ny)}`;
      })
      .join('') + 'Z'
  );
}

const shape = (d: string, x: number, y: number, w: number, h: number): Shape => ({ d, b: { x, y, w, h } });

/** The six cards. */
const CARDS = {
  dee: shape('M140,74H262A182,182 0 0 1 262,438H140A56,56 0 0 1 84,382V130A56,56 0 0 1 140,74Z', 84, 74, 360, 364),
  tower: shape(poly([[186, 56, 44], [326, 56, 44], [392, 456, 52], [120, 456, 52]]), 120, 56, 272, 400),
  disc: SHAPES.disc,
  container: SHAPES.land,
  ticket: shape('M96,136H416A40,40 0 0 1 456,176V222A34,34 0 0 0 456,290V336A40,40 0 0 1 416,376H96A40,40 0 0 1 56,336V290A34,34 0 0 0 56,222V176A40,40 0 0 1 96,136Z', 56, 136, 400, 240),
  house: shape(poly([[256, 52, 44], [446, 204, 50], [446, 444, 60], [66, 444, 60], [66, 204, 50]]), 66, 52, 380, 392),
};

/** The sheets behind the card: the card's own shape again, `[dx, dy, scale, turn°]` back to front. */
const SHEETS = {
  left: [[-68, 0, 0.8], [-34, 0, 0.9]],
  fan: [[0, 0, 1, -10], [0, 0, 1, 9]],
  upright: [[60, -50, 0.84], [30, -25, 0.92]],
} as const;


export const SUITE_MARKS: Record<SuiteApp, Def> = {
  // The D, with its three lines trailing off to the left; the sheets trail the same way.
  drift: { name: 'Drift', shape: CARDS.dee, sheets: 'left', at: [232, 256, 1.32], motion: 'slide', parts: [{ d: 'M6 12h9', cls: 'm1' }, { d: 'M8.5 7.8h5', cls: 'm2' }, { d: 'M8.5 16.2h5', cls: 'm2' }] },
  // A tower painted in bands, a lamp at the top.
  lighthouse: { name: 'Lighthouse', shape: CARDS.tower, sheets: 'fan', at: [256, 262], motion: 'glow', parts: [{ d: 'M9.2 13h5.6' }, { d: 'M8.6 17.6h6.8' }, { dot: [12, 7.4, 2], cls: 'm1' }] },
  // The harbour wall opens to the right, so it is also a C for calendar; the boat sits inside.
  harbour: { name: 'Harbour', shape: CARDS.disc, sheets: null, at: [256, 256, 0.95], motion: 'enter', parts: [{ d: 'M18.05 6.92A7.9 7.9 0 1 0 18.05 17.08' }, { dot: [12, 12, 1.9], cls: 'm1' }] },
  // One container with its ribs, more stacked behind.
  yard: { name: 'Yard', shape: CARDS.container, sheets: 'upright', motion: 'lift', parts: [5.4, 8.7, 12, 15.3, 18.6].map((x) => ({ d: `M${x} 7.6v8.8`, cls: 'm1' })) },
  // A ticket with a solid play mark and its tear line; a second ticket fans out behind.
  reel: { name: 'Reel', shape: CARDS.ticket, sheets: 'fan', at: [236, 256], motion: 'nudge', parts: [{ d: 'M9.4 9 14.4 12l-5 3z', solid: true, cls: 'm1' }, ...[7.2, 10.4, 13.6, 16.8].map((y) => ({ dot: [20, y, 0.8] as const }))] },
  // The house with its door open to the ground and a lamp above it (also someone at home).
  hearth: { name: 'Hearth', shape: CARDS.house, sheets: null, motion: 'glow', parts: [{ d: 'M203,444V323a53,53 0 0 1 106,0V444', raw: true, w: 30 }, { dot: [256, 196, 24], raw: true, cls: 'm1' }] },
};

const INK_PAPER = '#D54A33';
const EDGE_PAPER = '#E58C74';
const INK_MONO = '#111111';

/** The glyph's parts in one paint. `scale` and `width` are the 24 grid's; raw parts keep their own weight. */
function glyph(def: Def, paint: string, rawPaint: string, scale: number, width: number): string {
  const [ax, ay, k = 1] = def.at ?? [256, 256];
  const cls = (p: Part) => (p.cls ? ` class="${p.cls}"` : '');
  const grid = def.parts.filter((p) => !p.raw).map((p) => (p.dot ? `<circle${cls(p)} cx="${p.dot[0]}" cy="${p.dot[1]}" r="${p.dot[2]}" fill="${paint}" stroke="none"/>` : `<path${cls(p)} d="${p.d}" fill="${p.solid ? paint : 'none'}"/>`)).join('');
  const raw = def.parts.filter((p) => p.raw).map((p) => (p.dot ? `<circle${cls(p)} cx="${p.dot[0]}" cy="${p.dot[1]}" r="${p.dot[2]}" fill="${rawPaint}"/>` : `<path${cls(p)} d="${p.d}" fill="none" stroke="${rawPaint}" stroke-width="${p.w}" stroke-linecap="butt"/>`)).join('');
  const body = grid ? `<g transform="translate(${ax} ${ay}) scale(${+(scale * k).toFixed(3)}) translate(-12 -12)" fill="none" stroke="${paint}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${grid}</g>` : '';
  return raw + body;
}

/** The sheets in glass, the way Frameer's `behind` draws them: the back one in `s3`, the front one in `s2`, each with its white rim. */
function sheetsMarkup(p: string, def: Def): string {
  if (!def.sheets) return '';
  return SHEETS[def.sheets]
    .map(([dx, dy, k, rot = 0], i) => `<g transform="translate(${256 + dx} ${256 + dy}) rotate(${rot}) scale(${k}) translate(-256 -256)"><path d="${def.shape.d}" fill="url(#${p}${i ? 's2' : 's3'})"/><path d="${def.shape.d}" fill="none" stroke="#FFFFFF" stroke-opacity="${i ? 0.6 : 0.5}" stroke-width="3"/></g>`)
    .join('');
}

/** Places a card of bounds `b` centred on the 512 grid at `fit` px. */
function fitted(b: Shape['b'], fit: number, inner: string): string {
  const k = Math.min(fit / b.w, fit / b.h);
  return `<g transform="translate(256 256) scale(${k.toFixed(3)}) translate(${-(b.x + b.w / 2)} ${-(b.y + b.h / 2)})">${inner}</g>`;
}

/** The drawing a rendered size gets: the glass card from 48 px, the flat card below it. */
export const suiteVariantForSize = (size: number): 'full' | 'paper' => (size >= 48 ? 'full' : 'paper');

export interface SuiteMarkOptions {
  size?: number;
  /** The accessible name; '' makes the mark decorative. Defaults to the app's name. */
  label?: string;
}

/** One variant of one app's mark as an SVG document (512 grid). `prefix` keeps gradient ids apart when several are inlined in one page. */
export function suiteMarkSvg(app: SuiteApp, variant: SuiteVariant, prefix = 'sm', { size = 512, label }: SuiteMarkOptions = {}): string {
  const def = SUITE_MARKS[app];
  const name = (label ?? def.name).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const p = `${prefix}_`;
  const named = name ? ` role="img" aria-label="${name}"` : ' aria-hidden="true"';
  const open = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512" fill="none" class="sm sm-${def.motion}"${named}>`;
  const c = CORAL_PALETTE;
  const { b } = def.shape;

  const full = (transform: string) => `<g transform="${transform}" filter="url(#${p}shadow)">${sheetsMarkup(p, def)}${glass(p, c, def.shape)}${glyph(def, `url(#${p}ink24)`, `url(#${p}ink)`, 12, 2.5)}</g>`;

  switch (variant) {
    case 'full':
      return `${open}${defs(p, c)}${full(groupTransform(false))}</svg>`;
    case 'backdrop':
    case 'maskable': {
      const { tile, transform } = homeTile(p, variant);
      return `${open}${defs(p, c)}${tile}${full(transform)}</svg>`;
    }
    case 'paper': {
      const body = `<defs><linearGradient id="${p}pb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#FCE9DE"/></linearGradient></defs>`;
      return `${open}${body}${fitted(b, 476, `<path d="${def.shape.d}" fill="url(#${p}pb)" stroke="${EDGE_PAPER}" stroke-width="20"/>${glyph(def, INK_PAPER, INK_PAPER, 13.5, 2.9)}`)}</svg>`;
    }
    case 'tile':
      return `${open}${coralGradient(`${p}t`)}${fitted(b, 500, `<path d="${def.shape.d}" fill="url(#${p}t)"/>${glyph(def, MARK_CREAM, MARK_CREAM, 13.5, 2.9)}`)}</svg>`;
    case 'mono':
      return `${open}${fitted(b, 476, `<path d="${def.shape.d}" fill="none" stroke="${INK_MONO}" stroke-width="22"/>${glyph(def, INK_MONO, INK_MONO, 12, 2.4)}`)}</svg>`;
    case 'favicon': {
      // One file for both tab bars: the coral tile on a light one, the paper card on a dark one.
      const inner = (v: SuiteVariant, id: string) => suiteMarkSvg(app, v, `${prefix}${id}`, { label: '' }).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
      const style = '<style>.fp{display:none}@media (prefers-color-scheme:dark){.ft{display:none}.fp{display:inline}}</style>';
      return `${open}${style}<g class="ft">${inner('tile', 't')}</g><g class="fp">${inner('paper', 'p')}</g></svg>`;
    }
  }
}
