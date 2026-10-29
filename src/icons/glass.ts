/**
 * @file glass.ts
 * @description The glass drawing kit, ported from the icon generator page (drift-icons): shapes in a 512 grid, the shared gradient and filter definitions, the glass front (body, specular, sweep, inner glow, rim), the sheets behind a card, the folder, and the small helpers the marks of every kind are made of. Everything returns SVG markup as strings, so the same code renders in React (GlassIcon) and in Node (scripts/render-app-icons.mjs). Every id starts with a per-instance prefix, so two icons on a page never share a gradient.
 * Used by: kinds.ts, appIcon.ts, GlassIcon.
 */
import { paint, type Palette } from './palette.ts';

/** A rounded rectangle path. */
export const rr = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r},${y}H${x + w - r}A${r},${r} 0 0 1 ${x + w},${y + r}V${y + h - r}A${r},${r} 0 0 1 ${x + w - r},${y + h}H${x + r}A${r},${r} 0 0 1 ${x},${y + h - r}V${y + r}A${r},${r} 0 0 1 ${x + r},${y}Z`;

const foldPath = (x: number, y: number, w: number, h: number, r: number, f: number) =>
  `M${x + r},${y}H${x + w - f}L${x + w},${y + f}V${y + h - r}A${r},${r} 0 0 1 ${x + w - r},${y + h}H${x + r}A${r},${r} 0 0 1 ${x},${y + h - r}V${y + r}A${r},${r} 0 0 1 ${x + r},${y}Z`;

export interface Bounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Shape {
  d: string;
  b: Bounds;
  /** Rounded rectangles also give the sheets behind them their size. */
  rect?: Bounds & { r: number };
  /** Uploaded files get a folded corner. */
  fold?: boolean;
}

const R = (x: number, y: number, w: number, h: number, r: number): Shape & { rect: Bounds & { r: number } } => ({ d: rr(x, y, w, h, r), b: { x, y, w, h }, rect: { x, y, w, h, r } });

export const BOOK = 'M256,150C212,118 150,108 72,116V384C150,376 212,386 256,416C300,386 362,376 440,384V116C362,108 300,118 256,150Z';

export const SHAPES = {
  std: R(88, 74, 336, 364, 64),
  land: R(64, 112, 384, 288, 60),
  win: R(64, 104, 384, 304, 56),
  tile: R(100, 100, 312, 312, 88),
  pocket: R(88, 196, 336, 242, 52),
  fold: { d: foldPath(88, 74, 336, 364, 64, 96), b: { x: 88, y: 74, w: 336, h: 364 }, fold: true } as Shape,
  book: { d: BOOK, b: { x: 72, y: 108, w: 368, h: 308 } } as Shape,
  disc: { d: 'M76,256A180,180 0 1 0 436,256A180,180 0 1 0 76,256Z', b: { x: 76, y: 76, w: 360, h: 360 } } as Shape,
};
export type ShapeName = keyof typeof SHAPES;

const FOLDER_BACK = 'M88,130A48,48 0 0 1 136,82H204C220,82 229,88 237,98L247,110C251,114 255,116 263,116H376A48,48 0 0 1 424,164V390A48,48 0 0 1 376,438H136A48,48 0 0 1 88,390Z';

const stop = (offset: number | string, color: string, opacity?: number) => `<stop offset="${offset}" ${paint('stop-color', color)}${opacity === undefined ? '' : ` stop-opacity="${opacity}"`}/>`;

/** Gradients and filters every glass drawing of prefix `p` reads. */
export function defs(p: string, c: Palette): string {
  const vertical = (id: string, a: string, b: string) => `<linearGradient id="${p}${id}" x1="0" y1="0" x2="0" y2="1">${stop(0, a)}${stop(1, b)}</linearGradient>`;
  const ink = (id: string, x1: number, y1: number, x2: number, y2: number) =>
    `<linearGradient id="${p}${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" gradientUnits="userSpaceOnUse">${stop(0, c.ink[0])}${stop(1, c.ink[1])}</linearGradient>`;
  const shadow = (dy: number, dev: number, o: number) => `<feDropShadow dx="0" dy="${dy}" stdDeviation="${dev}" ${paint('flood-color', c.shadow)} flood-opacity="${o}"/>`;
  return `<defs>
  <linearGradient id="${p}body" x1="0" y1="0" x2="0" y2="1">${stop(0, '#FFFFFF')}${stop('.5', c.bodyMid)}${stop(1, c.body)}</linearGradient>
  ${vertical('s2', c.s2[0], c.s2[1])}${vertical('s3', c.s3[0], c.s3[1])}
  ${ink('ink', 124, 110, 390, 400)}${ink('ink24', 3, 3, 21, 21)}
  <radialGradient id="${p}spec" cx=".34" cy="-.04" r=".6">${stop(0, '#FFFFFF', 0.95)}${stop('.55', '#FFFFFF', 0.26)}${stop(1, '#FFFFFF', 0)}</radialGradient>
  <linearGradient id="${p}sweep" x1=".02" y1=".02" x2=".77" y2=".75">${stop(0, '#FFFFFF', 0.55)}${stop('.42', '#FFFFFF', 0.1)}${stop(1, '#FFFFFF', 0)}</linearGradient>
  <radialGradient id="${p}caus" cx=".5" cy="1.02" r=".62">${stop(0, c.caustic, 0.3)}${stop('.6', c.caustic, 0.09)}${stop(1, c.caustic, 0)}</radialGradient>
  <linearGradient id="${p}rim" x1="0" y1="0" x2="0" y2="1">${stop(0, '#FFFFFF')}${stop('.35', '#FFFFFF', 0.45)}${stop(1, '#FFFFFF', 0.22)}</linearGradient>
  <filter id="${p}blur" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="5"/></filter>
  <filter id="${p}shadow" x="-30%" y="-30%" width="160%" height="170%" color-interpolation-filters="sRGB">${shadow(14, 13, 0.26)}${shadow(3, 4, 0.16)}</filter>
</defs>`;
}

/** The glass front for any closed path: body, caustic glow, specular, sweep, inner glow and shade, top highlight and rim. */
export function glass(p: string, c: Palette, s: Shape): string {
  const { d, b } = s;
  let out = `<clipPath id="${p}clip"><path d="${d}"/></clipPath>
  <path d="${d}" fill="url(#${p}body)"/>
  <g clip-path="url(#${p}clip)">
    <ellipse cx="${b.x + b.w / 2}" cy="${b.y + b.h + 14}" rx="${b.w * 0.7}" ry="130" fill="url(#${p}caus)"/>
    <ellipse cx="${b.x + b.w * 0.35}" cy="${b.y - 24}" rx="${b.w * 0.8}" ry="160" fill="url(#${p}spec)"/>
    <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="url(#${p}sweep)"/>
    <path d="${d}" transform="translate(6,6)" fill="none" stroke="#FFFFFF" stroke-opacity=".85" stroke-width="7" filter="url(#${p}blur)"/>
    <path d="${d}" transform="translate(-6,-8)" fill="none" ${paint('stroke', c.shade)} stroke-opacity=".16" stroke-width="8" filter="url(#${p}blur)"/>
    <rect x="${b.x}" y="${b.y}" width="${b.w}" height="5" fill="#FFFFFF" fill-opacity=".9"/>
    <path d="${d}" fill="none" stroke="url(#${p}rim)" stroke-width="6"/>
  </g>`;
  if (s.fold) out += `<path d="M328,74V140Q328,170 358,170H424Z" fill="url(#${p}s2)"/><path d="M328,74V140Q328,170 358,170H424" fill="none" stroke="#FFFFFF" stroke-opacity=".7" stroke-width="3"/>`;
  return out;
}

const sheet = (p: string, id: string, x: number, y: number, w: number, h: number, r: number, rot: number, op: number) => {
  const t = rot ? ` transform="rotate(${rot} 256 256)"` : '';
  return `<path d="${rr(x, y, w, h, r)}" fill="url(#${p}${id})"${t}/><path d="${rr(x + 1.5, y + 1.5, w - 3, h - 3, r - 1.5)}" fill="none" stroke="#FFFFFF" stroke-opacity="${op}" stroke-width="3"${t}/>`;
};

/** How the sheets behind a card sit: stacked straight up, or fanned. */
export type Layout = 'straight' | 'fan' | 'papers';

/** The one or two sheets behind a card (one at small sizes, where more would be mush). */
export function behind(p: string, f: Bounds & { r: number }, layout: Layout, small: boolean): string {
  if (layout === 'straight') return small ? sheet(p, 's2', f.x + 28, f.y - 28, f.w - 56, f.h, f.r - 8, 0, 0.6) : sheet(p, 's3', f.x + 56, f.y - 40, f.w - 112, f.h - 24, f.r - 16, 0, 0.5) + sheet(p, 's2', f.x + 28, f.y - 20, f.w - 56, f.h - 4, f.r - 8, 0, 0.6);
  if (layout === 'fan') return small ? sheet(p, 's2', f.x, f.y, f.w, f.h, f.r, 8, 0.6) : sheet(p, 's3', f.x, f.y, f.w, f.h, f.r, -7, 0.5) + sheet(p, 's2', f.x, f.y, f.w, f.h, f.r, 6, 0.6);
  return '';
}

/** The back of a folder and the papers in it. The pocket (the glass front, `SHAPES.pocket`) is drawn after it, in a `gi-pocket` group that tips open on hover and while files are dragged over the folder. */
export function folderBack(p: string, c: Palette, papers: boolean, small: boolean): string {
  let s = `<path d="${FOLDER_BACK}" fill="url(#${p}s2)"/><path d="${FOLDER_BACK}" fill="none" stroke="#FFFFFF" stroke-opacity=".6" stroke-width="3"/>`;
  if (papers && small) s += `<rect x="132" y="126" width="248" height="200" rx="26" fill="#FFFDFB" transform="rotate(-4 256 250)"/>`;
  else if (papers) s += `<rect x="126" y="122" width="258" height="220" rx="26" fill="url(#${p}s3)" transform="rotate(-5 256 250)"/><g transform="rotate(4 256 250)"><rect x="142" y="136" width="242" height="210" rx="24" fill="#FFFDFB"/>${bar(174, 162, 110, 16, c.strong)}${bar(174, 188, 150, 12, c.soft)}</g>`;
  return s;
}

/* ---------- marks ---------- */

export const bar = (x: number, y: number, w: number, h: number, fill: string, op?: number) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" ${paint('fill', fill)}${op ? ` fill-opacity="${op}"` : ''}/>`;
export const box = (x: number, y: number, w: number, h: number, r: number, fill: string, extra = '') => `<path d="${rr(x, y, w, h, r)}" ${paint('fill', fill)}${extra}/>`;
export const stroke = (d: string, col: string, w: number) => `<path d="${d}" fill="none" ${paint('stroke', col)} stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
export const check = (cx: number, cy: number, k = 1) => stroke(`M${cx - 14 * k} ${cy} L${cx - 3.5 * k} ${cy + 10.5 * k} L${cx + 16 * k} ${cy - 11 * k}`, '#FFFFFF', 10 * k);
export const inkOf = (p: string) => `url(#${p}ink)`;

/** A photo window: sky, sun and mountains in the ink gradient. */
export function photo(p: string, c: Palette, win: string, mountains: string, sun: readonly [number, number, number]): string {
  return `<clipPath id="${p}win"><path d="${win}"/></clipPath><path d="${win}" fill="url(#${p}s3)" fill-opacity=".55"/>
    <g clip-path="url(#${p}win)"><circle cx="${sun[0]}" cy="${sun[1]}" r="${sun[2]}" ${paint('fill', c.ink[0])} fill-opacity=".75"/><path d="${mountains}" fill="${inkOf(p)}"/></g>`;
}
